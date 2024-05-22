import React, { useEffect, useState } from 'react'
import PT from 'prop-types'

const initialFormValues = { title: '', text: '', topic: '' }
const articlesUrl = 'http://localhost:9000/api/articles'


export default function ArticleForm(props) {
  const [values, setValues] = useState(initialFormValues)
  // ✨ where are my props? Destructure them here
  const { currentArticle, postArticle, updateArticle, setCurrentArticleId, logout } = props;

  useEffect(() => {
    // ✨ implement
    // Every time the `currentArticle` prop changes, we should check it for truthiness:
    // if it's truthy, we should set its title, text and topic into the corresponding
    // values of the form. If it's not, we should reset the form back to initial values.
    if (currentArticle) {
      setValues(currentArticle)
    } else {
      setValues(initialFormValues)
    }
  }, [currentArticle]);

  const onChange = evt => {
    const { id, value } = evt.target
    setValues({ ...values, [id]: value })
  }

  const onSubmit = evt => {
    evt.preventDefault()
    // ✨ implement
    // We must submit a new post or update an existing one,
    // depending on the truthyness of the `currentArticle` prop.
    

    const { title, text, topic } = values;

    const article = { title, text, topic };

    if (currentArticle) {
      fetch(articlesUrl/`${currentArticle.article_id}`, {
        method: "PUT",
        body: JSON.stringify(article),
        headers: {  
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem("token"),
         },
      })
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to update article.");
        }
        return response.json();
      })
      .then(data => {
        console.log('Article updated successfully:', data);
        updateArticle(data.article)
        setCurrentArticleId(null);
    })
    .catch(error => {
      console.error("Error updating article:", error);
      if (error?.response?.status === 401) logout();
    });
  } else {
   postArticle(article);
  }
};

  const isDisabled = () => {
    // ✨ implement
    // Make sure the inputs have some values
    if (initialFormValues) isDisabled;
  }

  return (
    // ✨ fix the JSX: make the heading display either "Edit" or "Create"
    // and replace Function.prototype with the correct function
    <form id="form" onSubmit={onSubmit}>
      <h2>{currentArticle ? "Edit" : "Create"} Article</h2>
      <input
        maxLength={50}
        onChange={onChange}
        value={values.title}
        placeholder="Enter title"
        id="title"
      />
      <textarea
        maxLength={200}
        onChange={onChange}
        value={values.text}
        placeholder="Enter text"
        id="text"
      />
      <select onChange={onChange} id="topic" value={values.topic}>
        <option value="">-- Select topic --</option>
        <option value="JavaScript">JavaScript</option>
        <option value="React">React</option>
        <option value="Node">Node</option>
      </select>
      <div className="button-group">
        <button disabled={isDisabled()} id="submitArticle">Submit</button>
        <button onClick={Function.prototype}>Cancel edit</button>
      </div>
    </form>
  )
}

// 🔥 No touchy: ArticleForm expects the following props exactly:
ArticleForm.propTypes = {
  postArticle: PT.func.isRequired,
  updateArticle: PT.func.isRequired,
  setCurrentArticleId: PT.func.isRequired,
  currentArticle: PT.shape({ // can be null or undefined, meaning "create" mode (as opposed to "update")
    article_id: PT.number.isRequired,
    title: PT.string.isRequired,
    text: PT.string.isRequired,
    topic: PT.string.isRequired,
  })
}
