module.exports = {
	plugins: [
		require('postcss-font-magician')({
			variants: {
				'Roboto Slab': {
					'300': [],
					'400': [],
					'700': [],
					'900': [],
				},
			},
			display: 'swap',
		}),
	]
};
