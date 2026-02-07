export const getRegionByLocation = (location: string): string => {
    // Extract UF from "City - UF" format
    const uf = location.split('-').pop()?.trim().toUpperCase();

    if (!uf) return 'Outros';

    const regions: Record<string, string[]> = {
        'Norte': ['AM', 'RR', 'AP', 'PA', 'TO', 'RO', 'AC'],
        'Nordeste': ['MA', 'PI', 'CE', 'RN', 'PB', 'PE', 'AL', 'SE', 'BA'],
        'Centro-Oeste': ['MT', 'MS', 'GO', 'DF'],
        'Sudeste': ['SP', 'RJ', 'ES', 'MG'],
        'Sul': ['PR', 'RS', 'SC']
    };

    for (const [region, ufs] of Object.entries(regions)) {
        if (ufs.includes(uf)) {
            return region;
        }
    }

    return 'Outros';
};
