/*
    This file implements the slider functionality for the slide show.
 */

let slideIndex = 1;

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("slide");
    let dots = document.getElementsByClassName("dot");

    if (n > slides.length) {
        slideIndex = 1
    }
    if (n < 1) {
        slideIndex = slides.length
    }

    for (i = 0; i < slides.length; i++) {
        slides[i].classList.remove("active");
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].classList.remove("active-dot");
    }

    slides[slideIndex-1].classList.add("active");
    dots[slideIndex-1].classList.add("active-dot");

    updateControls();
}

function moveSlides(n) {
    if (n < 0 && slideIndex === 1 ||
        n > 0 && slideIndex === document.getElementsByClassName('slide').length) {
        return;
    }
    showSlides(slideIndex += n);
}

function currentSlide(n) {
    showSlides(slideIndex = n);
}

function updateControls() {
    let prev = document.querySelector('.prev');
    let next = document.querySelector('.next');

    if (slideIndex === 1) {
        prev.classList.add('disabled');
    } else {
        prev.classList.remove('disabled');
    }

    if (slideIndex === document.getElementsByClassName('slide').length) {
        next.classList.add('disabled');
    } else {
        next.classList.remove('disabled');
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft') {
        moveSlides(-1);
    } else if (event.key === 'ArrowRight') {
        moveSlides(1);
    }
});

showSlides(slideIndex);