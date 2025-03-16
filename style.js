// Smooth scrolling for navigation links
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        targetElement.scrollIntoView({ behavior: 'smooth' });
    });
});

// Form validation and submission
document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();

    const firstName = document.getElementById('firstName').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const terms = document.querySelector('input[name="terms"]').checked;

    if (!firstName || !email || !message || !terms) {
        alert('Please fill out all fields and accept the terms.');
        return;
    }

    // Simulate form submission
    alert('Thank you for contacting us! We will get back to you soon.');

    // Clear form fields
    document.getElementById('firstName').value = '';
    document.getElementById('email').value = '';
    document.getElementById('message').value = '';
    document.querySelector('input[name="terms"]').checked = false;
});

// Dynamic testimonial carousel
let currentTestimonial = 0;
const testimonials = document.querySelectorAll('.testimonial');

function showTestimonial(index) {
    testimonials.forEach((testimonial, i) => {
        testimonial.style.display = i === index ? 'block' : 'none';
    });
}

function nextTestimonial() {
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    showTestimonial(currentTestimonial);
}

function prevTestimonial() {
    currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
    showTestimonial(currentTestimonial);
}

// Show the first testimonial initially
showTestimonial(currentTestimonial);

// Add navigation buttons for testimonials
const testimonialSection = document.getElementById('testimonials');
const prevButton = document.createElement('button');
prevButton.textContent = 'Previous';
prevButton.addEventListener('click', prevTestimonial);

const nextButton = document.createElement('button');
nextButton.textContent = 'Next';
nextButton.addEventListener('click', nextTestimonial);

testimonialSection.appendChild(prevButton);
testimonialSection.appendChild(nextButton);

// Dynamic content update for featured items
const featuredItems = [
    { name: 'Home Decore Range', popularity: 'High', sales: '46%' },
    { name: 'Disney Princess Dress', popularity: 'Medium', sales: '17%' },
    { name: 'Bathroom Essentials', popularity: 'Medium', sales: '19%' }
];

const featuredItemsContainer = document.createElement('div');
featuredItemsContainer.id = 'featured-items';

featuredItems.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'featured-item';
    itemElement.innerHTML = `
        <h3>${item.name}</h3>
        <p>Popularity: ${item.popularity}</p>
        <p>Sales: ${item.sales}</p>
    `;
    featuredItemsContainer.appendChild(itemElement);
});

document.body.appendChild(featuredItemsContainer);

// Add some basic styles for the new elements
const style = document.createElement('style');
style.textContent = `
    #featured-items {
        display: flex;
        justify-content: space-around;
        margin: 20px 0;
    }
    .featured-item {
        background: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        text-align: center;
    }
    button {
        padding: 10px;
        margin: 5px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    button:hover {
        background: #45a049;
    }
`;
document.head.appendChild(style);