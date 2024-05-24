import React, { useState } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'
import axios from '../axios'

const articlesUrl = 'http://localhost:9000/api/articles'
const loginUrl = 'http://localhost:9000/api/login'

export default function App() {
  // ✨ MVP can be achieved with these states
  const [message, setMessage] = useState('')
  const [articles, setArticles] = useState([])
  const [currentArticleId, setCurrentArticleId] = useState()
  const [spinnerOn, setSpinnerOn] = useState(false)

  // ✨ Research `useNavigate` in React Router v.6
  const navigate = useNavigate()
  const redirectToLogin = () => { navigate('/'); };
  const redirectToArticles = () => { navigate('/articles'); };

  // const token = localStorage.getItem('token')
  // console.log("Token:", token);

  const logout = () => {
    // ✨ implement
    // If a token is in local storage it should be removed,
    // and a message saying "Goodbye!" should be set in its proper state.
    // In any case, we should redirect the browser back to the login screen,
    // using the helper above.
    localStorage.removeItem("token");
    setMessage("Goodbye!");
    redirectToLogin();
  };

  const login = ({ username, password }) => {
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch a request to the proper endpoint.
    // On success, we should set the token to local storage in a 'token' key,
    // put the server success message in its proper state, and redirect
    // to the Articles screen. Don't forget to turn off the spinner!
    setMessage('');
    setSpinnerOn(true);

    fetch(loginUrl, {
      method: 'POST',
      body: JSON.stringify({ 
        username: username, 
        password: password
       }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem("token")
      },
  })
  .then(response => {
    console.log("raw response:", response);
    return response.json();
  })
  .then(res => {
    if (res.token) {
      localStorage.setItem("token", res.token);
      setMessage(res.message);
      redirectToArticles();
    } else {
      setMessage(res.message || "Login failed. Please try again.");
    }
  })
  .catch(error => {
    setMessage("Login failed. Please try again");
    console.error("Login error:", error);
  })
  .finally(() => setSpinnerOn(false));
};

  const getArticles = () => {
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch an authenticated request to the proper endpoint.
    // On success, we should set the articles in their proper state and
    // put the server success message in its proper state.
    // If something goes wrong, check the status of the response:
    // if it's a 401 the token might have gone bad, and we should redirect to login.
    // Don't forget to turn off the spinner!
    setMessage('');
    setSpinnerOn(true);

    // fetch(`${articlesUrl}`, {
    //   headers: { 
    //     Authorization: localStorage.getItem("token"), 
    //   }
    // })
    //   .then(response => {
    //     if (!response.ok) {
    //       throw new Error("Problem GETing articles");
    //   }
    //   return response.json();
    // })
    //   .then(res => {
    //     console.log(res.data);
    //     setArticles(res.data);
    //     setMessage(res.message);
    //   })
    //   .catch(error => {
    //     setMessage("Failed to fetch articles");
    //     if (error && error.status === 401) {
    //       redirectToLogin();
    //     }
    //   })
    //   .finally(() => setSpinnerOn(false));
      axios() 
        .get(articlesUrl)
        .then(response => {
          // console.log(response.data.articles);
          setArticles(response.data.articles);
          setMessage(response.data.message);
        })
        .catch(error => {
          setMessage("Failed to fetch articles");
          if (error && error.status === 401) {
            redirectToLogin();
          }
        })
        .finally(() => setSpinnerOn(false));
  };

  const postArticle = async (article) => {
    // ✨ implement
    // The flow is very similar to the `getArticles` function.
    // You'll know what to do! Use log statements or breakpoints
    // to inspect the response from the server.
    
    setMessage('')
    setSpinnerOn(true);
    try {
      const response = await fetch('http://localhost:9000/api/articles', { 
        method: 'POST', 
        headers: {
          "Content-Type": 'application/json',
          Authorization: localStorage.getItem("token")
        }, 
        body: JSON.stringify(article),
      });

      if (!response.ok) {
        throw new Error(`An error has occurred: ${response.status}`);
      }
    // if (!localStorage.getItem("token")) {
    //   redirectToLogin();
    //   return;
    // }
    const newArticle = await response.json();
    console.log('Article posted:', newArticle);
    setSpinnerOn(false);
    setMessage(response.message);
    setArticles(response.article);
    getArticles();
  } catch (error) {
      console.error("error posting article:", error);
  }
      // .then(res => {
      //   console.log(res)
      //   setArticles(res.article.concat(res.article));
      //   setMessage(res.message);
      // })
      // .catch(error => {
      //   setMessage(error.message);
      //   if (error.response && error.response.status === 401) {
      //     redirectToLogin();
      //   }
      // })
      // .finally(() => setSpinnerOn(false));
  }

  const updateArticle = ({ article_id, article }) => {
    // ✨ implement
    // You got this!
    fetch(`http://localhost:9000/api/articles/${article_id}`), {
      method: 'PUT',
      headers: {
        Authorization: localStorage.getItem("token")
      },
      body: JSON.stringify({ article })
      .then(response => {
        if (!response.ok) throw new Error("Problem POSTing article");
        return response.json();
      })
        .then(res => {
          setArticles(articles => {return articles.concat(res.data.article)});
          getArticles();
          setMessage(res.data.message);
        })
        .catch(error => {
          setMessage(error.data.message);
          if (error.response && error.response.status === 401) {
            redirectToLogin();
          }
        })
        .finally(() => setSpinnerOn(false))
    }
  }

  const deleteArticle = async (article_id) => {
    setSpinnerOn(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:9000/api/articles/${article_id}`, {
        method: 'DELETE',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json'
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete article.');
      }
      
      setArticles(prevArticles => prevArticles.filter(article => article.id !== article_id));
      setMessage(data.message);
      getArticles();
    
    } catch (error) {
      setMessage(error.message || 'Failed to delete article.');
    } finally {
        setSpinnerOn(false);
  }
};

  return (
    // ✨ fix the JSX: `Spinner`, `Message`, `LoginForm`, `ArticleForm` and `Articles` expect props ❗
    <>
      {spinnerOn && <Spinner on={spinnerOn} />}
      {message && <Message message={message} />}
      <button id="logout" onClick={logout}>Logout from app</button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}> {/* <-- do not change this line */}
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/" onClick={redirectToLogin}>Login</NavLink>
          <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login} />} />
          <Route path="articles" element={
            <>
              <ArticleForm currentArticleId={currentArticleId} postArticle={postArticle} updateArticle={updateArticle} setCurrentArticleId={setCurrentArticleId} logout={logout}/>
              <Articles setCurrentArticleId={setCurrentArticleId} currentArticleId={currentArticleId} articles={articles} deleteArticle={deleteArticle} updateArticle={updateArticle} getArticles={getArticles}/>
            </>
          } />
        </Routes>
        <footer>Bloom Institute of Technology 2024</footer>
      </div>
    </>
  )
}
