jQuery('document').ready(function($){
	// fading testimonials
	jQuery('.testimonials').innerfade({
	animationtype: 'fade', 
	speed: 'normal', 
	timeout: 4000,
	type: 'sequence',
	containerheight: '3.5em'});
});