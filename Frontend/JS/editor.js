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