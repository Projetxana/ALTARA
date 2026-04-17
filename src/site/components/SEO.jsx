import { useEffect } from 'react';

const SEO = ({ title, description, urlExt = "" }) => {
    useEffect(() => {
        // Mettre à jour le titre
        document.title = title;

        // Mettre à jour ou créer la meta description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.name = "description";
            document.head.appendChild(metaDescription);
        }
        metaDescription.content = description;

        // LodgingBusiness Schema Markup
        // Base URL, depending on current domain or explicitly https://chaletayana.ca
        const baseUrl = "https://chaletayana.ca";
        const pageUrl = `${baseUrl}${urlExt}`;

        const schemaMarkup = {
            "@context": "https://schema.org",
            "@type": "LodgingBusiness",
            "name": "Chalet Spa AYANA",
            "description": description,
            "url": pageUrl,
            "image": [
                `${baseUrl}/ayana/photos/v2/ayana-chalet-spa-laurentides.jpg`,
                `${baseUrl}/ayana/photos/v2/spa-prive-jacuzzi-laurentides.jpg`
            ],
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "5135 rue de la Tortille",
                "addressLocality": "Sainte-Adèle",
                "addressRegion": "QC",
                "postalCode": "J8B 2Y5", // Remplacez par le vrai code si différent
                "addressCountry": "CA"
            },
            "telephone": "514-979-3103",
            "priceRange": "$$$",
            "amenityFeature": [
                {
                    "@type": "LocationFeatureSpecification",
                    "name": "Spa privé",
                    "value": "True"
                },
                {
                    "@type": "LocationFeatureSpecification",
                    "name": "Sauna",
                    "value": "True"
                },
                {
                    "@type": "LocationFeatureSpecification",
                    "name": "Hammam",
                    "value": "True"
                },
                {
                    "@type": "LocationFeatureSpecification",
                    "name": "Jacuzzi extérieur",
                    "value": "True"
                }
            ]
        };

        let scriptTag = document.querySelector('script[id="schema-lodging"]');
        if (!scriptTag) {
            scriptTag = document.createElement('script');
            scriptTag.id = "schema-lodging";
            scriptTag.type = "application/ld+json";
            document.head.appendChild(scriptTag);
        }
        scriptTag.text = JSON.stringify(schemaMarkup);

        // Nettoyage au démontage
        return () => {
            // Optionnel : ne pas supprimer le schema si on passe d'une page à l'autre rapidement
            // Mais pour être propre on peut le réécrire avec la prochaine vue
        };

    }, [title, description, urlExt]);

    return null; // N'affiche rien dans le DOM React
};

export default SEO;
