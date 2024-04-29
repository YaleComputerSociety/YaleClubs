import ICAL from 'ical.js';

export const parseICSFile = async () => {
    try {
        const fileUri = '../../server/uploads/anton.melnychuk@yale.edu.ics';
        const response = await fetch(fileUri);

        if (!response.ok) {
            throw new Error(`Failed to fetch ICS file. HTTP status: ${response.status}`);
        }

        const fileContent = await response.text();
        const jcalData = ICAL.parse(fileContent);
        const comp = new ICAL.Component(jcalData);
        const vevents = comp.getAllProperties('vevent');
    
        const parsedEvents = vevents.map(vevent => {
            const summary = vevent.getFirstPropertyValue('summary');
            const description = vevent.getFirstPropertyValue('description');
            const start = vevent.getFirstPropertyValue('dtstart');
            const end = vevent.getFirstPropertyValue('dtend');
    
            return {
                summary,
                description,
                start: start.toJSDate(),
                end: end.toJSDate(),
            };
        });
    
    } catch (error) {
        console.error('Error parsing ICS file:', error);
    }
};
