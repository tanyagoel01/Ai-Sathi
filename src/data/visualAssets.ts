// Visual Assets Mapping for Interactive Learning
// Maps chapter concepts to their corresponding visual asset IDs (Lottie animations or SVGs)

export interface VisualAsset {
    keyword: string;
    assetId: string;
    description: string;
    type: 'lottie' | 'svg';
}

export const chapterVisuals: Record<string, VisualAsset[]> = {
    // Science - Human Body Chapter
    'human-body': [
        {
            keyword: 'Skeletal System',
            assetId: 'skeleton_animation',
            description: 'Interactive skeletal structure showing bones and joints',
            type: 'lottie'
        },
        {
            keyword: 'skeleton',
            assetId: 'skeleton_animation',
            description: 'Interactive skeletal structure',
            type: 'lottie'
        },
        {
            keyword: 'bones',
            assetId: 'skeleton_animation',
            description: 'Skeletal system with labeled bones',
            type: 'lottie'
        },
        {
            keyword: 'Muscles',
            assetId: 'muscle_contraction',
            description: 'Muscle contraction and relaxation animation',
            type: 'lottie'
        },
        {
            keyword: 'muscle',
            assetId: 'muscle_contraction',
            description: 'How muscles work in pairs',
            type: 'lottie'
        },
        {
            keyword: 'Reflex actions',
            assetId: 'reflex_arc',
            description: 'Diagram of a reflex arc pathway',
            type: 'lottie'
        },
        {
            keyword: 'reflex',
            assetId: 'reflex_arc',
            description: 'Reflex action pathway',
            type: 'lottie'
        },
        {
            keyword: 'Brain',
            assetId: 'brain_parts',
            description: 'Brain structure with cerebrum, cerebellum, and medulla',
            type: 'lottie'
        },
        {
            keyword: 'heart',
            assetId: 'heart_beat',
            description: 'Animated beating heart',
            type: 'lottie'
        }
    ],

    // Science - Plants Around Us Chapter
    'plants': [
        {
            keyword: 'Germination',
            assetId: 'seed_growth',
            description: 'Time-lapse animation of a seed germinating and growing',
            type: 'lottie'
        },
        {
            keyword: 'seed',
            assetId: 'seed_growth',
            description: 'Seed germination process',
            type: 'lottie'
        },
        {
            keyword: 'Seed dispersal',
            assetId: 'seed_dispersal',
            description: 'Animation showing different seed dispersal methods (wind, water, animal)',
            type: 'lottie'
        },
        {
            keyword: 'dispersal',
            assetId: 'seed_dispersal',
            description: 'How seeds spread',
            type: 'lottie'
        },
        {
            keyword: 'photosynthesis',
            assetId: 'photosynthesis',
            description: 'Process of photosynthesis in leaves',
            type: 'lottie'
        },
        {
            keyword: 'roots',
            assetId: 'plant_parts',
            description: 'Plant parts and their functions',
            type: 'lottie'
        }
    ],

    // Maths - Numbers and Operations (Fractions)
    'numbers': [
        {
            keyword: 'Fraction',
            assetId: 'pizza_division',
            description: 'Interactive pizza/circle divided into equal parts to show fractions',
            type: 'lottie'
        },
        {
            keyword: 'fraction',
            assetId: 'pizza_division',
            description: 'Dividing shapes into equal parts',
            type: 'lottie'
        },
        {
            keyword: 'Division',
            assetId: 'division_visual',
            description: 'Visual representation of division',
            type: 'lottie'
        },
        {
            keyword: 'division',
            assetId: 'division_visual',
            description: 'Division concept visualization',
            type: 'lottie'
        },
        {
            keyword: 'place value',
            assetId: 'place_value',
            description: 'Place value chart animation',
            type: 'lottie'
        }
    ],

    // Maths - Shapes and Patterns
    'shapes': [
        {
            keyword: 'Perimeter',
            assetId: 'perimeter_walk',
            description: 'Animation tracing the boundary of different shapes',
            type: 'lottie'
        },
        {
            keyword: 'perimeter',
            assetId: 'perimeter_walk',
            description: 'Walking around the edge of shapes',
            type: 'lottie'
        },
        {
            keyword: 'Area',
            assetId: 'area_fill',
            description: 'Counting squares inside shapes to show area',
            type: 'lottie'
        },
        {
            keyword: 'area',
            assetId: 'area_fill',
            description: 'Space inside shapes',
            type: 'lottie'
        },
        {
            keyword: 'Symmetry',
            assetId: 'symmetry_fold',
            description: 'Line of symmetry and reflection',
            type: 'lottie'
        },
        {
            keyword: 'symmetry',
            assetId: 'symmetry_fold',
            description: 'Mirror images and symmetry lines',
            type: 'lottie'
        },
        {
            keyword: 'Angles',
            assetId: 'angle_types',
            description: 'Different types of angles (acute, obtuse, right)',
            type: 'lottie'
        },
        {
            keyword: 'angle',
            assetId: 'angle_types',
            description: 'Angle measurement visualization',
            type: 'lottie'
        }
    ],

    // Maths - Measurement
    'measurement': [
        {
            keyword: 'Perimeter',
            assetId: 'perimeter_walk',
            description: 'Tracing shape boundaries',
            type: 'lottie'
        },
        {
            keyword: 'Area',
            assetId: 'area_fill',
            description: 'Filling shapes with unit squares',
            type: 'lottie'
        },
        {
            keyword: 'Length',
            assetId: 'measurement_scale',
            description: 'Measuring with rulers and scales',
            type: 'lottie'
        }
    ],

    // Maths - Division
    'division': [
        {
            keyword: 'Division',
            assetId: 'division_visual',
            description: 'Visual representation of division',
            type: 'lottie'
        },
        {
            keyword: 'division',
            assetId: 'division_visual',
            description: 'Division concept visualization',
            type: 'lottie'
        },
        {
            keyword: 'share',
            assetId: 'pizza_division',
            description: 'Sharing equally',
            type: 'lottie'
        },
        {
            keyword: 'equal',
            assetId: 'pizza_division',
            description: 'Equal groups',
            type: 'lottie'
        }
    ]
};

/**
 * Find matching visual asset for a given query and chapter
 * @param query - User's question or AI response text
 * @param chapter - Current chapter key
 * @returns VisualAsset if found, null otherwise
 */
export function findVisualAsset(query: string, chapter: string): VisualAsset | null {
    const assets = chapterVisuals[chapter];
    if (!assets) return null;

    // Convert query to lowercase for case-insensitive matching
    const lowerQuery = query.toLowerCase();

    // Find the first matching asset based on keyword
    const matchedAsset = assets.find(asset =>
        lowerQuery.includes(asset.keyword.toLowerCase())
    );

    return matchedAsset || null;
}

/**
 * Get all visual assets for a specific chapter
 * @param chapter - Chapter key
 * @returns Array of VisualAssets for the chapter
 */
export function getChapterVisuals(chapter: string): VisualAsset[] {
    return chapterVisuals[chapter] || [];
}
