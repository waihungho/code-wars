-- Equipment catalog seed data (all 25 items from src/lib/constants.ts)
INSERT INTO equipment_items (id, name, slot_type, effect_type, effect_value, sol_price, description) VALUES
('summon-3',         'Extra Summon (x3)',       'consumable',           'add_pulls',         '{"amount": 3}',                                                    0.02,  '+3 gacha pulls'),
('summon-10',        'Extra Summon (x10)',      'consumable',           'add_pulls',         '{"amount": 10}',                                                   0.05,  '+10 gacha pulls'),
('summon-50',        'Extra Summon (x50)',      'consumable',           'add_pulls',         '{"amount": 50}',                                                   0.20,  '+50 gacha pulls'),
('battle-10',        'Battle Pass (x10)',       'consumable',           'add_battles',       '{"amount": 10}',                                                   0.01,  '+10 daily battles'),
('battle-20',        'Battle Pass (x20)',       'consumable',           'add_battles',       '{"amount": 20}',                                                   0.02,  '+20 daily battles'),
('battle-unlimited', 'Unlimited Battle Pass',   'consumable',           'unlimited_battles', '{"hours": 24}',                                                    1.00,  'Unlimited battles for 24h'),
('stat-chip-1',      'Stat Chip I',             'stat_boost',           'stat_percent',      '{"percent": 10}',                                                  0.05,  '+10% to one stat'),
('stat-chip-2',      'Stat Chip II',            'stat_boost',           'stat_percent',      '{"percent": 25}',                                                  0.20,  '+25% to one stat'),
('stat-chip-3',      'Stat Chip III',           'stat_boost',           'stat_percent',      '{"percent": 50}',                                                  0.50,  '+50% to one stat'),
('omni-chip',        'Omni Chip',               'stat_boost',           'all_stats_percent', '{"percent": 15}',                                                  1.00,  '+15% to ALL stats'),
('trigger-amp-1',    'Trigger Amplifier I',     'ability_enhancement',  'trigger_chance',    '{"chance": 0.45}',                                                 0.10,  'Ability trigger 30% → 45%'),
('trigger-amp-2',    'Trigger Amplifier II',    'ability_enhancement',  'trigger_chance',    '{"chance": 0.60}',                                                 0.35,  'Ability trigger 30% → 60%'),
('passive-boost',    'Passive Booster',         'ability_enhancement',  'passive_multiply',  '{"multiplier": 2}',                                                0.15,  'Passive ability bonus doubled'),
('overcharge',       'Ability Overcharge',      'ability_enhancement',  'overcharge',        '{"passiveMultiplier": 2, "chance": 0.50}',                          0.75,  'Passive doubled + trigger 50%'),
('dim-scout',        'Dimension Scout',         'utility',              'preview_dimension', '{"count": 1}',                                                     0.05,  'Preview 1 of 3 battle dimensions'),
('xp-magnet-1',      'XP Magnet I',             'utility',              'xp_multiplier',     '{"multiplier": 1.5}',                                              0.08,  '+50% XP from battles'),
('xp-magnet-2',      'XP Magnet II',            'utility',              'xp_multiplier',     '{"multiplier": 2.0}',                                              0.30,  '+100% XP from battles'),
('lucky-charm',      'Lucky Charm',             'utility',              'rarity_boost',      '{"bonus": 0.05}',                                                  0.50,  '+5% higher rarity chance'),
('ai-core',          'AI Core',                 'ai_core',              'ai_core',           '{"allStatsPercent": 50, "triggerChance": 0.70, "passiveMultiplier": 3, "xpMultiplier": 2.0}', 10.00, '+50% ALL stats, trigger 70%, passive x3, +100% XP')
ON CONFLICT (id) DO NOTHING;
