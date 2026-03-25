from flask import Flask, render_template
import pyodbc

app = Flask(__name__)

# Cấu hình chuỗi kết nối đến SQL Server
# LƯU Ý: Thay 'localhost\SQLEXPRESS' bằng tên Server Name thực tế trong SSMS của bạn
conn_str = (
    r'DRIVER={ODBC Driver 17 for SQL Server};'
    r'SERVER=ASUS-VIVOBOOK\CLCCSDLPTNHOM4;' 
    r'DATABASE=HumanDB;'
    r'Trusted_Connection=yes;'
)

@app.route('/')
def index():
    # 1. Kết nối tới database
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    # 2. Câu lệnh SQL dùng JOIN để lấy toàn bộ thông tin người + tên loại người
    query = """
        SELECT 
            h.id, 
            h.name, 
            h.dob, 
            h.gender, 
            t.name AS type_name
        FROM Human h
        JOIN HumanType t ON h.typeid = t.typeid
    """
    cursor.execute(query)
    data = cursor.fetchall()
    
    # 3. Đóng kết nối
    conn.close()
    
    # 4. Truyền dữ liệu sang file HTML
    return render_template('index.html', humans=data)

if __name__ == '__main__':
    app.run(debug=True)