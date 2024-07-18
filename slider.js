/*
    This file implements the slider functionality for the slide show.
 */

const slides = document.querySelectorAll('.slide');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');

let currentSlide = 0;

function showSlide() {
    slides.forEach((slide, index) => {
        slide.style.display = index === currentSlide ? 'block' : 'none';
    });
}

prevButton.addEventListener('click', () => {
    currentSlide = Math.max(currentSlide - 1, 0);
    showSlide();
});

nextButton.addEventListener('click', () => {
    currentSlide = Math.min(currentSlide + 1, slides.length - 1);
    showSlide();
});

showSlide();
