'use client';

export default function MobileMenuButton() {
  function toggleMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.toggle('hidden');
  }

  return (
    <button
      className="lg:hidden text-gray-600 hover:text-indigo-600 p-2"
      onClick={toggleMenu}
      aria-label="選單"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </button>
  );
}
