-- 0006_seed_galeria.sql
-- Siembra walkers.galeria con las fotos de paseo del mock (src/data/walkers.ts).
-- El seed 0004 no la pobló; sin esto, Paseos recientes, el check-in del paseo
-- en vivo y la foto del cuidador en chat salen vacíos. Idempotente (UPDATE por id).

update public.walkers set galeria = array[
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=900&q=70&sig=1',
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=900&q=70&sig=2',
    'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=70&sig=17'
  ]::text[] where id = 'ana';
update public.walkers set galeria = array[
    'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=900&q=70&sig=14',
    'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=900&q=70&sig=6',
    'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=900&q=70&sig=10'
  ]::text[] where id = 'lucia';
update public.walkers set galeria = array[
    'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=900&q=70&sig=7',
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=70&sig=4',
    'https://images.unsplash.com/photo-1494947665470-20322015e3a8?auto=format&fit=crop&w=900&q=70&sig=11'
  ]::text[] where id = 'marcos';
update public.walkers set galeria = array[
    'https://images.unsplash.com/photo-1591946614720-90a587da4a36?auto=format&fit=crop&w=900&q=70&sig=5',
    'https://images.unsplash.com/photo-1601758174039-8c34e0f5b3a4?auto=format&fit=crop&w=900&q=70&sig=3',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=70&sig=18'
  ]::text[] where id = 'sofia';
update public.walkers set galeria = array[
    'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=900&q=70&sig=13',
    'https://images.unsplash.com/photo-1601758174039-8c34e0f5b3a4?auto=format&fit=crop&w=900&q=70&sig=3',
    'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=900&q=70&sig=10'
  ]::text[] where id = 'javier';
update public.walkers set galeria = array[
    'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=900&q=70&sig=6',
    'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=70&sig=17',
    'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=70&sig=16'
  ]::text[] where id = 'elena';
update public.walkers set galeria = array[
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=70&sig=4',
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=70&sig=15',
    'https://images.unsplash.com/photo-1494947665470-20322015e3a8?auto=format&fit=crop&w=900&q=70&sig=11'
  ]::text[] where id = 'diego';
update public.walkers set galeria = array[
    'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=900&q=70&sig=12',
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=900&q=70&sig=2',
    'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=900&q=70&sig=10'
  ]::text[] where id = 'paula';
update public.walkers set galeria = array[
    'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=900&q=70&sig=14',
    'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=900&q=70&sig=12',
    'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=70&sig=17'
  ]::text[] where id = 'carlos';
update public.walkers set galeria = array[
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=70&sig=15',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=70&sig=9',
    'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=70&sig=16'
  ]::text[] where id = 'irene';
update public.walkers set galeria = array[
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=70&sig=18',
    'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=900&q=70&sig=10',
    'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=70&sig=16'
  ]::text[] where id = 'mateo';
update public.walkers set galeria = array[
    'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=70&sig=16',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=70&sig=18',
    'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=70&sig=17'
  ]::text[] where id = 'natalia';
