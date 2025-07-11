import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './cors.ts';

// Helper para validar campos
function ensure(value, field) {
    const invalid = value === null || value === undefined || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0);
    if (invalid) {
        throw new Response(JSON.stringify({ error: `Campo obrigatório faltando: ${field}` }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const body = await req.json();

        // Validação dos dados recebidos
        ensure(body.businessSlug, 'businessSlug');
        ensure(body.cart, 'cart');
        ensure(body.customerDetails, 'customerDetails');

        const { businessSlug, cart, customerDetails, deliveryFee = 0 } = body;

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL'),
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        );

        // 1. Busca o perfil do negócio para obter o user_id
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('business_slug', businessSlug)
            .single();

        if (profileError || !profile) {
            throw new Error('Negócio não encontrado ou erro ao buscar perfil.');
        }
        const userId = profile.id;

        // 2. Busca as credenciais de pagamento
        const { data: paymentSettings, error: settingsError } = await supabase
            .from('payment_settings')
            .select('mercadopago_access_token')
            .eq('user_id', userId)
            .single();

        if (settingsError || !paymentSettings?.mercadopago_access_token) {
            throw new Error('Credenciais do Mercado Pago não configuradas.');
        }
        const accessToken = paymentSettings.mercadopago_access_token;

        // 3. Prepara os itens para o Mercado Pago
        const items = cart.map((item) => ({
            id: item.id,
            title: item.name,
            quantity: item.quantity,
            unit_price: Number(item.price),
            currency_id: 'BRL',
        }));

        if (deliveryFee > 0) {
            items.push({
                id: 'delivery',
                title: 'Taxa de Entrega',
                quantity: 1,
                unit_price: Number(deliveryFee),
                currency_id: 'BRL',
            });
        }

        const total = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

        // 4. ## Bloco de Inserção Corrigido ##
        // Insere o pedido na tabela kitchen_orders com todos os campos necessários
        const { data: newOrder, error: orderError } = await supabase
            .from('kitchen_orders')
            .insert({
                user_id: userId,
                customer_name: customerDetails.name,
                customer_phone: customerDetails.phone,
                customer_email: customerDetails.email,
                delivery_address: `${customerDetails.address}, ${customerDetails.neighborhood}`,
                items: cart, // Salva o carrinho original no banco
                total: total,
                payment_method: 'online',
                order_type: deliveryFee > 0 ? 'delivery' : 'pickup',
                status: 'pending_payment',
                payment_status: 'pending',
            })
            .select('id')
            .single();

        if (orderError) {
            console.error('Erro ao inserir pedido no Supabase:', orderError);
            throw new Error('Falha ao registrar o pedido no banco de dados.');
        }
        const internalOrderId = newOrder.id;

        // 5. Prepara e cria a preferência de pagamento no Mercado Pago
        const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:3000';
        const preferenceBody = {
            items,
            payer: {
                name: customerDetails.name,
                email: customerDetails.email,
            },
            back_urls: {
                success: `${siteUrl}/payment-status`,
                failure: `${siteUrl}/payment-status`,
                pending: `${siteUrl}/payment-status`,
            },
            auto_return: 'approved',
            external_reference: String(internalOrderId),
            notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook?order_id=${internalOrderId}`,
        };

        const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(preferenceBody),
        });

        const preference = await mpResponse.json();
        if (!mpResponse.ok) {
            console.error('Erro do Mercado Pago:', preference);
            throw new Error(`Erro ao criar preferência no Mercado Pago.`);
        }

        // 6. Atualiza o pedido com o ID da preferência do Mercado Pago
        await supabase
            .from('kitchen_orders')
            .update({ mercadopago_preference_id: preference.id })
            .eq('id', internalOrderId);

        // 7. Retorna o ID da preferência para o frontend
        return new Response(JSON.stringify({ preferenceId: preference.id }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (err) {
        console.error('Erro inesperado na função:', err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});