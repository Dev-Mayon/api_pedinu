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

        // Validação
        ensure(body.businessSlug, 'businessSlug');
        ensure(body.cart, 'cart');
        ensure(body.customerDetails, 'customerDetails');

        const { businessSlug, cart, customerDetails, deliveryFee = 0 } = body;

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL'),
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        );

        // 1. Busca o perfil do negócio
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('business_slug', businessSlug)
            .single();

        if (!profile) {
            throw new Error('Negócio não encontrado.');
        }
        const userId = profile.id;

        // 2. Busca as credenciais de pagamento
        const { data: paymentSettings } = await supabase
            .from('payment_settings')
            .select('mercadopago_access_token')
            .eq('user_id', userId)
            .single();

        if (!paymentSettings?.mercadopago_access_token) {
            throw new Error('Credenciais do Mercado Pago não configuradas.');
        }
        const accessToken = paymentSettings.mercadopago_access_token;

        // 3. Prepara os itens para o Mercado Pago e calcula o total
        const itemsForMp = cart.map((item) => ({
            id: item.id,
            title: item.name,
            quantity: Number(item.quantity || 1),
            unit_price: Number(item.price || 0),
            currency_id: 'BRL',
        }));

        if (deliveryFee > 0) {
            itemsForMp.push({
                id: 'delivery',
                title: 'Taxa de Entrega',
                quantity: 1,
                unit_price: Number(deliveryFee),
                currency_id: 'BRL',
            });
        }
        const totalAmount = itemsForMp.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

        // 4. Cria um objeto limpo para o banco de dados com os valores CORRIGIDOS
        const orderForDb = {
            user_id: userId,
            customer_name: customerDetails.name,
            customer_phone: customerDetails.phone,
            customer_email: customerDetails.email,
            delivery_address: `${customerDetails.address}, ${customerDetails.neighborhood}`,
            items: cart,
            total: totalAmount,
            // ✅ CORREÇÃO: Usando 'pix', um valor que sabemos que existe no seu enum, em vez de 'online'
            payment_method: 'pix',
            order_type: deliveryFee > 0 ? 'delivery' : 'pickup',
            // ✅ CORREÇÃO: Usando 'received', um valor que sabemos que existe no seu enum, em vez de 'pending_payment'
            status: 'received',
            payment_status: 'pending',
        };

        // 5. Insere o pedido no banco de dados
        const { data: newOrder, error: orderError } = await supabase
            .from('kitchen_orders')
            .insert(orderForDb)
            .select('id')
            .single();

        if (orderError) {
            console.error('ERRO FINAL DO BANCO DE DADOS:', orderError);
            throw new Error(`Falha ao registrar o pedido: ${orderError.message}`);
        }
        const internalOrderId = newOrder.id;

        // 6. ✅ NOVA FUNCIONALIDADE: Cria pagamento PIX em vez de preferência
        const pixPaymentBody = {
            transaction_amount: totalAmount,
            description: `Pedido #${internalOrderId} - ${businessSlug}`,
            payment_method_id: 'pix',
            payer: {
                email: customerDetails.email,
                first_name: customerDetails.name.split(' ')[0],
                last_name: customerDetails.name.split(' ').slice(1).join(' ') || customerDetails.name.split(' ')[0],
                identification: {
                    type: 'CPF',
                    number: '00000000000' // Placeholder - PIX não exige CPF obrigatório
                }
            },
            external_reference: String(internalOrderId),
            notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook?order_id=${internalOrderId}`,
        };

        const pixResponse = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${accessToken}`, 
                'Content-Type': 'application/json',
                'X-Idempotency-Key': `pix-${internalOrderId}-${Date.now()}`
            },
            body: JSON.stringify(pixPaymentBody),
        });

        const pixPayment = await pixResponse.json();
        if (!pixResponse.ok) {
            console.error('Erro ao criar pagamento PIX:', pixPayment);
            throw new Error(`Erro ao criar pagamento PIX: ${pixPayment.message || 'Erro desconhecido'}`);
        }

        await supabase.from('kitchen_orders').update({ mercadopago_payment_id: pixPayment.id }).eq('id', internalOrderId);

        // ✅ RETORNA DADOS DO PIX em vez de preferenceId
        return new Response(JSON.stringify({ 
            paymentType: 'pix',
            paymentId: pixPayment.id,
            qrCode: pixPayment.point_of_interaction?.transaction_data?.qr_code,
            qrCodeBase64: pixPayment.point_of_interaction?.transaction_data?.qr_code_base64,
            orderId: internalOrderId
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
