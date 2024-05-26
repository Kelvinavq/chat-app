import { format, isToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Función para formatear la fecha y la hora del mensaje
const formatMessageTime = (timestamp) => {
    try {
        let date;
        if (typeof timestamp === 'string') {
          date = parseISO(timestamp); // Manejo de fechas en formato ISO
        } else {
          date = new Date(timestamp); // Manejo de timestamps
        }
        if (isToday(date)) {
          return format(date, 'HH:mm', { locale: es });
        } else {
          return format(date, 'dd/MM/yyyy HH:mm', { locale: es });
        }
      } catch (error) {
        console.error('Error parsing date:', error);
        return '';
      }
};

export default formatMessageTime;
