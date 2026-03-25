function switchTab(tabId) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });

    const selectedContent = document.getElementById(tabId);
    if (selectedContent) {
        selectedContent.classList.add('active');
        selectedContent.style.display = 'block';
    }

    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
    });

    const clickedMenu = document.querySelector(`.menu-item[onclick*="${tabId}"]`);
    if (clickedMenu) {
        clickedMenu.classList.add('active');
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
}