let mainEditor;
let genEditor;
let bruteEditor;
let optEditor;

require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs' } });

require(['vs/editor/editor.main'], function () {
    
    mainEditor = monaco.editor.create(document.getElementById('monaco-editor'), {
        value: '#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}',
        language: 'cpp',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 15,
        minimap: { enabled: false }
    });

    genEditor = monaco.editor.create(document.getElementById('editor-gen'), {
        value: 'import random\n\n# Sinh ngẫu nhiên số N từ 1 đến 100\nprint(random.randint(1, 100))',
        language: 'python',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: false }
    });

    bruteEditor = monaco.editor.create(document.getElementById('editor-brute'), {
        value: '// Thuật trâu C++\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int n; cin >> n;\n    cout << n;\n    return 0;\n}',
        language: 'cpp',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: false }
    });

    optEditor = monaco.editor.create(document.getElementById('editor-opt'), {
        value: '// Thuật tối ưu C++\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int n; cin >> n;\n    cout << n;\n    return 0;\n}',
        language: 'cpp',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: false }
    });
});

function changeLanguage() {
    const lang = document.getElementById('lang-select').value;
    const fileName = document.getElementById('file-name');
    const langLabel = document.getElementById('lang-label');

    if (lang === 'cpp') {
        fileName.textContent = 'Main.cpp';
        langLabel.textContent = 'C++';
        langLabel.style.color = '#cccccc';
    } else if (lang === 'java') {
        fileName.textContent = 'Main.java';
        langLabel.textContent = 'Java';
        langLabel.style.color = '#cccccc';
    } else if (lang === 'python') {
        fileName.textContent = 'main.py';
        langLabel.textContent = 'Python';
        langLabel.style.color = '#cccccc';
    } 

    if (mainEditor) {
        monaco.editor.setModelLanguage(mainEditor.getModel(), lang);
        
        if (lang === 'cpp') {
            mainEditor.setValue('#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}');
        } else if (lang === 'java') {
            mainEditor.setValue('public class Main {\n    public static void main(String[] args) {\n        \n    }\n}');
        } else if (lang === 'python') {
            mainEditor.setValue('print("Hello Python!")');
        }
    }
}

// Hàm thay đổi ngôn ngữ cho từng khung Editor trong Test Generator
function changeTestLang(editorType) {
    // Đảm bảo thư viện monaco đã được tải xong
    if (typeof monaco !== 'undefined') {
        if (editorType === 'gen' && typeof genEditor !== 'undefined') {
            const lang = document.getElementById('lang-gen').value;
            monaco.editor.setModelLanguage(genEditor.getModel(), lang);
        } 
        else if (editorType === 'brute' && typeof bruteEditor !== 'undefined') {
            const lang = document.getElementById('lang-brute').value;
            monaco.editor.setModelLanguage(bruteEditor.getModel(), lang);
        } 
        else if (editorType === 'opt' && typeof optEditor !== 'undefined') {
            const lang = document.getElementById('lang-opt').value;
            monaco.editor.setModelLanguage(optEditor.getModel(), lang);
        }
    }
}

// --- HÀM GỌI BACKEND NHÀ LÀM (CHUẨN ONECOMPILER) ---
async function runCode() {
    const langCode = document.getElementById('lang-select').value;
    const input = document.getElementById('user-input').value;
    const outputConsole = document.getElementById('output-console');
    const btnRun = document.getElementById('btnRun');

    const code = typeof mainEditor !== 'undefined' ? mainEditor.getValue() : '';

    if (!code.trim()) {
        outputConsole.textContent = "Vui lòng nhập code trước khi chạy!";
        outputConsole.style.color = "#e74c3c";
        return;
    }

    // Đưa định dạng ngôn ngữ về cho Backend hiểu
    let backendLang = "";
    if (langCode === 'cpp') backendLang = "c++";
    else if (langCode === 'python') backendLang = "python";
    else if (langCode === 'java') backendLang = "java";

    btnRun.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Running...';
    btnRun.disabled = true;
    outputConsole.textContent = "Đang biên dịch và chạy code...";
    outputConsole.style.color = "#cccccc";

    try {
        // Gửi thẳng sang API Backend nội bộ ở cổng 5000
        const response = await fetch('http://127.0.0.1:5000/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                language: backendLang,
                code: code,
                input: input
            })
        });

        const result = await response.json();

        if (result.code !== 0) {
            // Lỗi Compile hoặc Runtime (Chữ đỏ)
            outputConsole.textContent = result.stderr || "Lỗi không xác định";
            outputConsole.style.color = "#e74c3c"; 
        } else {
            // Output thật sự (Chữ xanh lá)
            outputConsole.textContent = result.stdout || "Chương trình chạy xong (Không in ra gì cả)";
            outputConsole.style.color = "#2ecc71"; 
        }

    } catch (error) {
        outputConsole.textContent = "Không gọi được Backend!\nNhớ mở terminal gõ 'python app.py' để bật server nhé.";
        outputConsole.style.color = "#e74c3c"; 
    } finally {
        btnRun.innerHTML = '<i class="fa-solid fa-play"></i> Run';
        btnRun.disabled = false;
    }
}