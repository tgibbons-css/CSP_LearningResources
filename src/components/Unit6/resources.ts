export const localSources = {
  city: 'https://hermantownmn.com/community/community-highlights/google-announces-plans-for-hermantown-data-center/',
  mpr: 'https://www.mprnews.org/story/2026/06/25/at-packed-hermantown-open-house-google-tries-to-ease-data-center-concerns',
  fox: 'https://www.fox9.com/news/google-revealed-developer-behind-controversial-hermantown-data-center',
  mcea: 'https://www.mncenter.org/op-ed-local-view-answers-needed-resources-hogging-hermantown-data-center',
  utility: 'https://hermantownmn.com/wp-content/uploads/2026/03/PressRelease03032026.pdf',
  project: 'https://hermantownmn.com/project/',
} as const;
export const pods = [
  {id: 'energy', label: 'Pod 1: Energy & The Grid', fact: 'Minnesota Power’s March 3, 2026 announcement describes 700 MW of new resources: 300 MW wind and 400 MW battery storage. Storage shifts energy; it does not generate it. This package does not establish the facility’s actual demand.',
    questions: ['How do MW of capacity differ from MWh of energy delivered?', 'What evidence would show that costs and reliability are protected for existing customers?', 'What happens during a low-wind period after batteries discharge?'],
    sources: [{label: 'Minnesota Power announcement · primary source (PDF)', url: localSources.utility}, {label: 'MPR · June 25, 2026 reporting', url: localSources.mpr}]},
  {id: 'water', label: 'Pod 2: Water & Cooling Systems', fact: 'MPR’s June 25 report describes air cooling or recirculating closed-loop options, with lower direct water needs and an electricity trade-off. Opponents quoted by FOX 9 raise concerns about wetlands and designated trout streams; a concern is not a measured impact.',
    questions: ['Which water is withdrawn, recirculated, consumed, or used indirectly in power generation?', 'Why could reducing on-site water needs increase electricity demand?', 'What monitoring would test watershed and stormwater concerns?'],
    sources: [{label: 'MPR · reported cooling options', url: localSources.mpr}, {label: 'FOX 9 · March 3 community concerns', url: localSources.fox}, {label: 'City · environmental-review documents', url: localSources.project}]},
  {id: 'value', label: 'Pod 3: Economic & Compute Value', fact: 'MPR reported a proposed investment approaching $2 billion. The City’s announcement presents anticipated economic benefits; these are stakeholder expectations to evaluate, rather than guaranteed net community gains.',
    questions: ['Who benefits from the computing services, and which benefits remain local?', 'How would you distinguish construction work, permanent jobs, gross investment, and net fiscal benefit?', 'What evidence could justify the fifth V, Value, after accounting for resource costs?'],
    sources: [{label: 'City · March 3 announcement (primary source)', url: localSources.city}, {label: 'MPR · investment and community perspectives', url: localSources.mpr}, {label: 'MCEA · advocacy op-ed, March 16', url: localSources.mcea}]},
  {id: 'community', label: 'Pod 4: Local Land Use & Community Impact', fact: 'MPR locates the roughly 280-acre proposal near Midway Road and Morris Thomas Road. The City’s March 31 scoping notice describes a 278-acre review area. Check map boundaries and dates rather than treating rounded areas as contradictions.',
    questions: ['How might noise, light, traffic, and land-use change affect nearby households?', 'What do the developer, city, and advocacy sources each emphasize or leave uncertain?', 'What measurable protections and public reporting would your home group require?'],
    sources: [{label: 'MPR · June 25 site and neighborhood reporting', url: localSources.mpr}, {label: 'City · current project documents', url: localSources.project}, {label: 'MCEA · advocacy perspective', url: localSources.mcea}]},
] as const;
