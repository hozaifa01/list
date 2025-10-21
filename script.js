document.addEventListener('DOMContentLoaded', () => {
    // جلب العناصر من الصفحة
    const addItemForm = document.getElementById('add-item-form');
    const itemNameInput = document.getElementById('item-name');
    const itemQuantityInput = document.getElementById('item-quantity');
    const itemUnit = document.getElementById('item-unit');
    const itemPriceInput = document.getElementById('item-price');
    const shoppingList = document.getElementById('shopping-list');
    const totalPriceEl = document.getElementById('total-price');
    const newListBtn = document.getElementById('new-list-btn');
    const saveListBtn = document.getElementById('save-list-btn');
    const printListBtn = document.getElementById('print-list-btn');
    const savedListsTableBody = document.querySelector('#saved-lists-table tbody');
    const currentListTitle = document.getElementById('current-list-title');

    // متغيرات لتخزين حالة التطبيق
    let currentList = [];
    let savedLists = JSON.parse(localStorage.getItem('shoppingLists')) || [];
    let currentListId = null;

    // دالة لرسم قائمة التسوق الحالية
    function renderCurrentList() {
        shoppingList.innerHTML = '';
        let total = 0;
        currentList.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="item-info">
                    <span>${item.name} (الكمية: ${item.quantity} ${item.unit})</span>
                    <span> - ${item.price.toFixed(2)}</span>
                </div>
                <div class="item-actions">
                    <button class="remove-item-btn" data-index="${index}" title="حذف المنتج">❌</button>
                    <button class="edit-item-btn" data-index="${index}" title="تعديل المنتج">✏️</button>
                </div>
            `;
            shoppingList.appendChild(li);
            total += item.price * item.quantity;
        });
        totalPriceEl.textContent = total.toFixed(2);
        updateSaveButtonState();
    }

    // دالة لرسم جدول القوائم المحفوظة
    function renderSavedLists() {
        savedListsTableBody.innerHTML = '';
        // ترتيب القوائم حسب التاريخ
        savedLists.sort((a, b) => b.id - a.id);
        savedLists.forEach((list, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(list.id).toLocaleString('ar-AR')}</td>
                <td>${list.items.length}</td>
                <td>
                    <button class="action-btn view-btn" data-index="${index}">استعراض</button>
                    <button class="action-btn delete-btn" data-index="${index}">حذف</button>
                </td>
            `;
            savedListsTableBody.appendChild(tr);
        });
    }

    // دالة لتحديث حالة زر الحفظ
    function updateSaveButtonState() {
        saveListBtn.disabled = currentList.length === 0;
        saveListBtn.style.cursor = currentList.length === 0 ? 'not-allowed' : 'pointer';
    }

    // إضافة منتج جديد
    addItemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = itemNameInput.value.trim();
        const quantity = parseFloat(itemQuantityInput.value);
        const price = parseFloat(itemPriceInput.value);
        
        if (!name || quantity <= 0 || price <= 0) {
            alert('يرجى التأكد من إدخال جميع الحقول بشكل صحيح!');
            return;
        }

        const newItem = {
            name,
            quantity,
            unit: itemUnit.value,
            price
        };
        currentList.push(newItem);
        renderCurrentList();
        itemNameInput.value = '';
        itemQuantityInput.value = '1';
        itemPriceInput.value = '';
    });

    // تعديل منتج في القائمة
    shoppingList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item-btn')) {
            const index = e.target.getAttribute('data-index');
            currentList.splice(index, 1);
            renderCurrentList();
        }
        
        if (e.target.classList.contains('edit-item-btn')) {
            const index = e.target.getAttribute('data-index');
            const itemToEdit = currentList[index];
            itemNameInput.value = itemToEdit.name;
            itemQuantityInput.value = itemToEdit.quantity;
            itemPriceInput.value = itemToEdit.price;
            currentList.splice(index, 1);
            renderCurrentList();
        }
    });

    // بدء قائمة جديدة
    newListBtn.addEventListener('click', () => {
        currentList = [];
        currentListId = null;
        currentListTitle.textContent = 'قائمة تسوق جديدة';
        renderCurrentList();
    });

    // حفظ القائمة الحالية
    saveListBtn.addEventListener('click', () => {
        if (currentList.length === 0) return;
        if (currentListId) {
            // تحديث قائمة موجودة
            const listIndex = savedLists.findIndex(list => list.id === currentListId);
            if (listIndex > -1) {
                savedLists[listIndex].items = currentList;
            }
        } else {
            // حفظ قائمة جديدة
            const newList = {
                id: Date.now(),
                items: currentList
            };
            savedLists.push(newList);
            currentListId = newList.id;
            currentListTitle.textContent = `قائمة تسوق (${new Date(currentListId).toLocaleDateString()})`;
        }
        localStorage.setItem('shoppingLists', JSON.stringify(savedLists));
        renderSavedLists();
        alert('تم حفظ القائمة بنجاح!');
    });

    // التعامل مع أزرار القوائم المحفوظة (استعراض وحذف)
    savedListsTableBody.addEventListener('click', (e) => {
        const index = e.target.getAttribute('data-index');
        if (e.target.classList.contains('view-btn')) {
            const listToView = savedLists[index];
            currentList = [...listToView.items];
            currentListId = listToView.id;
            currentListTitle.textContent = `عرض / تعديل قائمة`;
            renderCurrentList();
            window.scrollTo(0, 0); // الانتقال لأعلى الصفحة
        }
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('هل أنت متأكد من رغبتك في حذف هذه القائمة؟')) {
                savedLists.splice(index, 1);
                localStorage.setItem('shoppingLists', JSON.stringify(savedLists));
                renderSavedLists();
                // إذا كانت القائمة المحذوفة هي نفسها القائمة الحالية
                if (currentListId === savedLists[index]?.id) {
                    newListBtn.click();
                }
            }
        }
    });

    // طباعة القائمة الحالية
    printListBtn.addEventListener('click', () => {
        window.print();
    });

    // تهيئة التطبيق عند التحميل
    renderCurrentList();
    renderSavedLists();
});