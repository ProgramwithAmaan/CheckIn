document.addEventListener('DOMContentLoaded', function () {
  const scroller = document.querySelector('.filters-scroll');
  const left = document.querySelector('.filter-arrow.left');
  const right = document.querySelector('.filter-arrow.right');
  const scrollAmount = 260;

  if (left && right && scroller) {
    left.addEventListener('click', () => scroller.scrollBy({ left: -scrollAmount, behavior: 'smooth' }));
    right.addEventListener('click', () => scroller.scrollBy({ left: scrollAmount, behavior: 'smooth' }));

    // Drag to scroll (mouse)
    let isDown = false;
    let startX;
    let scrollLeft;

    scroller.addEventListener('mousedown', (e) => {
      isDown = true;
      scroller.classList.add('dragging');
      startX = e.pageX - scroller.offsetLeft;
      scrollLeft = scroller.scrollLeft;
    });
    scroller.addEventListener('mouseleave', () => { isDown = false; scroller.classList.remove('dragging'); });
    scroller.addEventListener('mouseup', () => { isDown = false; scroller.classList.remove('dragging'); });
    scroller.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - scroller.offsetLeft;
      const walk = (x - startX) * 1.2;
      scroller.scrollLeft = scrollLeft - walk;
    });

    // Touch support
    scroller.addEventListener('touchstart', (e) => {
      startX = e.touches[0].pageX - scroller.offsetLeft;
      scrollLeft = scroller.scrollLeft;
    });
    scroller.addEventListener('touchmove', (e) => {
      const x = e.touches[0].pageX - scroller.offsetLeft;
      const walk = (x - startX) * 1.2;
      scroller.scrollLeft = scrollLeft - walk;
    });
  }

  // Toggle active state for filters (visual only)
  document.querySelectorAll('.filter').forEach((f) => {
    f.addEventListener('click', () => {
      // Remove active-filter from all filters
      document.querySelectorAll('.filter').forEach(filter => {
        filter.classList.remove('active-filter');
      });
      // Add active-filter to clicked filter
      f.classList.add('active-filter');
      
      // Get filter text
      const filterText = f.querySelector('p').textContent;
      
      // Redirect to listings page with filter query
      window.location.href = `/listings?filter=${encodeURIComponent(filterText)}`;
    });
  });


});
