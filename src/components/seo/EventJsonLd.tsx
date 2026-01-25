import { EventConfig } from "@/data/events";

export function EventJsonLd({ event }: { event: EventConfig }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "EducationEvent",
        "name": event.title,
        "description": event.description,
        "startDate": event.date,
        "endDate": new Date(new Date(event.date).getTime() + event.durationHours * 60 * 60 * 1000).toISOString(),
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/MixedEventAttendanceMode",
        "location": [
            {
                "@type": "Place",
                "name": event.location,
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": event.address.split(',')[0],
                    "addressLocality": "Salzburg",
                    "postalCode": "5020",
                    "addressCountry": "AT"
                }
            },
            {
                "@type": "VirtualLocation",
                "url": "https://kideepdive.strategenwerk.com"
            }
        ],
        "image": [
            "https://kideepdive.strategenwerk.com/logo.png"
        ],
        "organizer": {
            "@type": "Person",
            "name": "Momo Feichtinger",
            "url": "https://strategenwerk.com"
        },
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "EUR",
            "availability": event.capacity > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
            "url": "https://kideepdive.strategenwerk.com"
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
