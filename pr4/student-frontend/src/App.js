import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = "http://localhost:8080/api/students";

function App() {
  const [students, setStudents] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [formData, setFormData] = useState({ name: '', age: '', email: '', details: '' });
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);

  // Отримання списку студентів
  const fetchStudents = async (searchKeyword = "") => {
    try {
      const url = searchKeyword ? `${API_URL}?keyword=${searchKeyword}` : API_URL;
      const response = await fetch(url);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Помилка завантаження даних", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Обробка пошуку
  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents(keyword);
  };

  // Кнопка Reset (скидання пошуку)
  const handleReset = () => {
    setKeyword("");
    fetchStudents("");
  };

  // Обробка введення у форму
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null }); // Прибираємо помилку при введенні
  };

  // Додавання або Редагування студента
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); 

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrors(data); // Зберігаємо помилки з бекенду
        return;
      }

      setFormData({ name: '', age: '', email: '', details: '' });
      setEditingId(null);
      fetchStudents(keyword); 
    } catch (error) {
      console.error("Помилка відправки даних", error);
    }
  };

  // Видалення
  const handleDelete = async (id) => {
    if (!window.confirm("Ви впевнені, що хочете видалити цього студента?")) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      fetchStudents(keyword);
    } catch (error) {
      console.error("Помилка видалення", error);
    }
  };

  // Підготовка до редагування
  const handleEdit = (student) => {
    setEditingId(student.id);
    setFormData({
      name: student.name,
      age: student.age,
      email: student.email,
      details: student.details || ''
    });
    setErrors({});
  };

  // Скасування редагування
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', age: '', email: '', details: '' });
    setErrors({});
  };

  return (
    <div className="container">
      <h2 className="main-title">Управління студентами</h2>
      
      {/* 1. Кнопки Search / Reset та форма пошуку */}
      <form onSubmit={handleSearch} className="search-form">
        <input 
          type="text" 
          value={keyword} 
          onChange={(e) => setKeyword(e.target.value)} 
          placeholder="Пошук за ім'ям або email..." 
        />
        <button type="submit" className="btn btn-primary">Search</button>
        <button type="button" onClick={handleReset} className="btn btn-secondary">Reset</button>
      </form>

      {/* Форма додавання/редагування */}
      <form onSubmit={handleSubmit} className="student-form">
        <h3>{editingId ? "✏️ Редагувати студента" : "➕ Додати студента"}</h3>
        
        <div className="form-group">
          <label>Ім'я:</label>
          {/* 2. Підсвітка помилок: додаємо клас 'input-error', якщо є помилка */}
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            className={errors.name ? "input-error" : ""}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label>Вік:</label>
          <input 
            type="number" 
            name="age" 
            value={formData.age} 
            onChange={handleChange} 
            className={errors.age ? "input-error" : ""}
          />
          {errors.age && <span className="error-text">{errors.age}</span>}
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            className={errors.email ? "input-error" : ""}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>Деталі:</label>
          <input 
            type="text" 
            name="details" 
            value={formData.details} 
            onChange={handleChange} 
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-success">
            {editingId ? "Зберегти зміни" : "Додати студента"}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit} className="btn btn-warning">
              Скасувати
            </button>
          )}
        </div>
      </form>

      {/* Таблиця студентів */}
      <table className="students-table">
        <thead>
          <tr>
            <th>Ім'я</th>
            <th>Вік</th>
            <th>Email</th>
            <th>Деталі</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map(student => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.age}</td>
                <td>{student.email}</td>
                <td>{student.details}</td>
                <td className="action-buttons">
                  <button onClick={() => handleEdit(student)} className="btn btn-warning btn-sm">Редагувати</button>
                  <button onClick={() => handleDelete(student.id)} className="btn btn-danger btn-sm">Видалити</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{textAlign: "center"}}>Студентів не знайдено</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;