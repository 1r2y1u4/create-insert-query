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
    const generatedSql = generateBulkInsertSQL(textAreaValue, tableName); // テーブル名を渡す
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
      <h1 className="title">INSERT文 ジェネレーター</h1>
      <p className="description">
        バルク形式のINSERT文を作成するためのアプリケーションです。<br></br>
        スプレッドシートなどの表で作成したデータをペーストすることで、INSERT文の作成ができます。
      </p>
      <p>
        1行目に選択した部分がカラム名となり、2行目以降はレコードとして認識されます。<br></br>
        カラム名の末尾に[:int]もしくは[:bool]をつけると、要素に''がつかなくなります。（下記画像参照）
      </p>
      <div className="images-container">
        <img className='table-img' src='/table.png' alt='table'></img>
        <img className='result-img' src='/result.png' alt='result'></img>
      </div>
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

function generateBulkInsertSQL(data, tableName) {
  const rows = data.trim().split('\n');
  if (rows.length === 0 || !tableName) {
    return '';
  }

  // 最初の行からカラム名と型を抽出
  const columnDefinitions = rows[0].split('\t').map(col => {
    const [name, type] = col.includes(':') ? col.split(':') : [col, 'string'];
    return { name, type };
  });

  // 値の行を処理し、適切な形式に変換
  const values = rows.slice(1).map(row =>
    `(${row.split('\t').map((value, index) => {
      const type = columnDefinitions[index].type;
      switch (type) {
        case 'int':
        case 'bool':
          return value; // 数値やブール値はクォートなし
        case 'string':
        default:
          return `'${value.replace(/'/g, "''")}'`; // 文字列はシングルクォートで囲む
      }
    }).join(', ')})`
  ).join(',\n');

  // カラム名を抽出
  const columns = columnDefinitions.map(def => def.name).join(', ');

  // 一つのINSERT文で全ての値を挿入
  return `INSERT INTO ${tableName} (${columns}) VALUES\n${values};`;
}

export default App;
