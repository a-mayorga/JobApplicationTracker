// lib/formatDate.ts
export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('es-MX', {
	day: '2-digit',
	month: '2-digit',
	year: 'numeric'
  });
}
