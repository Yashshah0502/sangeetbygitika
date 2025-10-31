function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  menu.classList.toggle("open");
  icon.classList.toggle("open");
}

// Navbar scroll effect
window.addEventListener("scroll", () => {
  const nav = document.querySelector("nav");
  if (window.scrollY > 100) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("fade-in");
    }
  });
}, observerOptions);

// Observe all sections for animations
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section");
  sections.forEach((section) => {
    observer.observe(section);
  });

  // Add animation classes to elements
  const timelineEntries = document.querySelectorAll(".timeline-entry");
  timelineEntries.forEach((entry, index) => {
    entry.style.animationDelay = `${index * 0.2}s`;
    observer.observe(entry);
  });

  const projectCards = document.querySelectorAll(".color-container");
  projectCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
    observer.observe(card);
  });
});

// Typing effect for the main title
function typeWriter(element, text, speed = 100) {
  let i = 0;
  element.innerHTML = "";

  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }

  type();
}

// Initialize typing effect when page loads
window.addEventListener("load", () => {
  const titleElement = document.querySelector("#profile .title");
  if (titleElement) {
    const originalText = titleElement.textContent;
    typeWriter(titleElement, originalText, 150);
  }
});

// Form submission handler
document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.querySelector("#contact form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Get form data
      const formData = new FormData(contactForm);
      const name = formData.get("name");
      const email = formData.get("email");
      const message = formData.get("message");

      // Simple validation
      if (!name || !email || !message) {
        alert("Please fill in all fields");
        return;
      }

      // Show success message
      const submitBtn = contactForm.querySelector(".submit-btn");
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Message Sent!";
      submitBtn.style.background = "#27ae60";

      // Reset form
      contactForm.reset();

      // Reset button after 3 seconds
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.background = "";
      }, 3000);
    });
  }
});

// Add parallax effect to profile section
window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset;
  const profileSection = document.querySelector("#profile");
  if (profileSection) {
    profileSection.style.transform = `translateY(${scrolled * 0.5}px)`;
  }
});

// Skills animation on scroll
const skillsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const articles = entry.target.querySelectorAll("article");
        articles.forEach((article, index) => {
          setTimeout(() => {
            article.style.opacity = "1";
            article.style.transform = "translateY(0)";
          }, index * 100);
        });
      }
    });
  },
  { threshold: 0.5 }
);

document.addEventListener("DOMContentLoaded", () => {
  const skillsSection = document.querySelector("#Skills");
  if (skillsSection) {
    skillsObserver.observe(skillsSection);

    // Initially hide articles for animation
    const articles = skillsSection.querySelectorAll("article");
    articles.forEach((article) => {
      article.style.opacity = "0";
      article.style.transform = "translateY(30px)";
      article.style.transition = "all 0.6s ease";
    });
  }
});

// Dark mode toggle functionality
document.addEventListener("DOMContentLoaded", () => {
  const darkModeToggle = document.getElementById("darkModeToggle");
  const body = document.body;

  // Check for saved dark mode preference
  const isDarkMode = localStorage.getItem("darkMode") === "true";
  if (isDarkMode) {
    body.classList.add("dark-mode");
  }

  darkModeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", body.classList.contains("dark-mode"));
  });
});

// Scroll indicator
window.addEventListener("scroll", () => {
  const scrollIndicator = document.getElementById("scrollIndicator");
  const scrollTop =
    document.documentElement.scrollTop || document.body.scrollTop;
  const scrollHeight =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;
  const scrollPercentage = (scrollTop / scrollHeight) * 100;

  scrollIndicator.style.width = scrollPercentage + "%";
});

// Enhanced navigation highlighting
window.addEventListener("scroll", () => {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a");

  let current = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (window.pageYOffset >= sectionTop - 200) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
});

// Add loading animation to buttons
document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    if (
      this.classList.contains("project-btn") &&
      this.textContent.includes("Github")
    ) {
      return; // Don't add loading to external links
    }

    const originalText = this.textContent;
    this.innerHTML = '<span class="loading"></span> Loading...';

    setTimeout(() => {
      this.textContent = originalText;
    }, 2000);
  });
});

// Intersection Observer for staggered animations
const staggerObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const children = entry.target.children;
        Array.from(children).forEach((child, index) => {
          setTimeout(() => {
            child.classList.add("fade-in");
          }, index * 100);
        });
      }
    });
  },
  { threshold: 0.3 }
);

// Apply staggered animations to containers
document.addEventListener("DOMContentLoaded", () => {
  const containers = document.querySelectorAll(
    ".about-containers, .projects-row"
  );
  containers.forEach((container) => {
    staggerObserver.observe(container);
  });
});

// Enhanced form validation
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Add real-time form validation
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#contact form");
  if (form) {
    const inputs = form.querySelectorAll("input, textarea");

    inputs.forEach((input) => {
      input.addEventListener("blur", function () {
        validateField(this);
      });

      input.addEventListener("input", function () {
        clearValidation(this);
      });
    });
  }
});

function validateField(field) {
  const value = field.value.trim();
  const fieldName = field.name;

  // Remove existing error styling
  field.classList.remove("error");

  let isValid = true;
  let errorMessage = "";

  if (!value) {
    isValid = false;
    errorMessage = `${
      fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
    } is required`;
  } else if (fieldName === "email" && !validateEmail(value)) {
    isValid = false;
    errorMessage = "Please enter a valid email address";
  }

  if (!isValid) {
    field.classList.add("error");
    showFieldError(field, errorMessage);
  }

  return isValid;
}

function clearValidation(field) {
  field.classList.remove("error");
  const errorElement = field.parentNode.querySelector(".error-message");
  if (errorElement) {
    errorElement.remove();
  }
}

function showFieldError(field, message) {
  clearValidation(field);
  const errorElement = document.createElement("span");
  errorElement.className = "error-message";
  errorElement.textContent = message;
  errorElement.style.color = "#e74c3c";
  errorElement.style.fontSize = "0.8rem";
  errorElement.style.marginTop = "5px";
  errorElement.style.display = "block";
  field.parentNode.appendChild(errorElement);
}
