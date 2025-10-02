export function generateColorFromString(text: string): string {
	let hash = 0;
	if (text.length === 0) return '#FFFFFF';
	for (let i = 0; i < text.length; i++) {
		hash = text.charCodeAt(i) + ((hash << 5) - hash);
		hash = hash & hash;
	}
	let color = '#';
	for (let i = 0; i < 3; i++) {
		const value = (hash >> (i * 8)) & 255;
		color += ('00' + value.toString(16)).slice(-2);
	}
	return color;
}
