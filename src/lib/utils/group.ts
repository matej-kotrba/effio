import type { User } from '@prisma/client';

export function transformCategoryNameToSlug(category: string) {
	const slug = `${category.toLowerCase()}-${crypto.randomUUID().split('-')[0]}`;
	return slug;
}

export function getBotChannelUser() {
	return {
		name: 'Effiogen',
		image: '/imgs/content_imgs/effio-bot.png',
		description: 'Finding out the best test!'
	} satisfies Pick<User, 'name' | 'image' | 'description'>;
}
