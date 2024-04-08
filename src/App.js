import React, { useState } from 'react';
import './App.css'

function App() {
  const [textAreaValue, setTextAreaValue] = useState('');
  const [tableName, setTableName] = useState(''); // テーブル名を管理するためのstate
  const [sqlQuery, setSqlQuery] = useState('');

  const handleTextAreaChange = (e) => {
    setTextAreaValue(e.target.value);
  };

  const handleTableNameChange = (e) => {
    setTableName(e.target.value); // テーブル名の変更をハンドル
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const generatedSql = generateInsertSQL(textAreaValue, tableName); // テーブル名を渡す
    setSqlQuery(generatedSql);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('SQLクエリがクリップボードにコピーされました。');
    } catch (err) {
      console.error('クリップボードへのコピーに失敗しました。', err);
    }
  };

  const handleCopy = () => {
    copyToClipboard(sqlQuery);
  };

  return (
    <div className="container">
      <form onSubmit={handleFormSubmit}>
        <div className="formControl">
          <label className="label">
            Table Name:
            <input type="text" value={tableName} onChange={handleTableNameChange} className="input" />
          </label>
        </div>
        <div className="formControl">
          <label className="label">
            Data (Paste here):
            <textarea value={textAreaValue} onChange={handleTextAreaChange} className="textarea" />
          </label>
        </div>
        <button type="submit" className="button">Generate SQL</button>
      </form>
      <pre className="pre">{sqlQuery}</pre>
      {sqlQuery && <button onClick={handleCopy} className={`button copyButton`}>コピー</button>}
    </div>
  );
}

function generateInsertSQL(data, tableName) {
  const rows = data.trim().split('\n');
  if (rows.length === 0 || !tableName) {
    return '';
  }

  // 最初の行からカラム名と型を抽出
  const columnDefinitions = rows[0].split('\t').map(col => {
    const [name, type] = col.includes(':') ? col.split(':') : [col, 'string'];
    return { name, type };
  });

  // 値の行を処理
  const values = rows.slice(1).map(row =>
    row.split('\t').map((value, index) => {
      const type = columnDefinitions[index].type;
      switch (type) {
        case 'int':
        case 'bool':
          return value; // 数値やブール値はクォートなし
        case 'string':
        default:
          return `'${value.replace(/'/g, "''")}'`; // 文字列はシングルクォートで囲む
      }
    }).join(', ')
  );

  // SQLクエリを生成
  const columns = columnDefinitions.map(def => def.name).join(', ');
  const queries = values.map(value =>
    `INSERT INTO ${tableName} (${columns}) VALUES (${value});`
  ).join('\n');

  return queries;
}


export default App;
