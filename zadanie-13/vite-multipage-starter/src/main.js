import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = "https://zadanie-13.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlZ3h2d3Zob2NiZmR3Zmlqc2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMDkzNjYsImV4cCI6MjA2NDc4NTM2Nn0.Z6TJ0gsMGJMFM1V4Gs6sKolzksfCBftiQaaPMUPmvcI";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); 

const articlesList = document.getElementById('articles-list')
const articleModal = document.getElementById('article-modal')
const articleForm = document.getElementById('article-form')
const modalCloseBtn = document.getElementById('modal-close-btn')

const btnAddArticle = document.createElement('button')
btnAddArticle.textContent = 'Dodaj artykuł'
btnAddArticle.className = 'btn'
document.body.insertBefore(btnAddArticle, articlesList)

const btnLogout = document.createElement('button')
btnLogout.textContent = 'Wyloguj się'
btnLogout.className = 'btn'
document.body.appendChild(btnLogout)

let currentUser = null

async function checkUser() {
  const { data } = await supabase.auth.getUser()
  currentUser = data.user
  if (!currentUser) {
    window.location.href = '/login/'
  }
}

async function loadArticles() {
  articlesList.innerHTML = '<h2>Artykuły:</h2>'
  const { data, error } = await supabase
    .from('zadanie_13')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    articlesList.innerHTML += `<p>Błąd ładowania artykułów: ${error.message}</p>`
    return
  }

  data.forEach(article => {
    const articleEl = document.createElement('article')
    articleEl.className = 'article'
    articleEl.innerHTML = `
      <h3>${article.title}</h3>
      <h4>${article.subtitle}</h4>
      <p><em>Autor: ${article.author}</em></p>
      <p><small>Data utworzenia: ${new Date(article.created_at).toLocaleString()}</small></p>
      <p>${article.content}</p>
    `

    if (currentUser && currentUser.id === article.user_id) {
      const editBtn = document.createElement('button')
      editBtn.textContent = 'Edytuj'
      editBtn.className = 'btn'
      editBtn.onclick = () => openEditModal(article)
      articleEl.appendChild(editBtn)

      const deleteBtn = document.createElement('button')
      deleteBtn.textContent = 'Usuń'
      deleteBtn.className = 'btn btn-danger'
      deleteBtn.onclick = () => deleteArticle(article.id)
      articleEl.appendChild(deleteBtn)
    }

    articlesList.appendChild(articleEl)
  })
}

function openEditModal(article = null) {
  articleModal.classList.remove('hidden')

  if (article) {
    articleForm['article-id'].value = article.id
    articleForm['article-title'].value = article.title
    articleForm['article-subtitle'].value = article.subtitle
    articleForm['article-content'].value = article.content
    articleForm['article-author'].value = article.author
  } else {
    articleForm.reset()
    articleForm['article-id'].value = ''
  }
}

modalCloseBtn.onclick = () => {
  articleModal.classList.add('hidden')
}

articleForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const id = articleForm['article-id'].value
  const title = articleForm['article-title'].value
  const subtitle = articleForm['article-subtitle'].value
  const content = articleForm['article-content'].value
  const author = articleForm['article-author'].value
  const created_at = new Date().toISOString()

  if (!currentUser) {
    alert('Musisz być zalogowany, aby dodawać/edytować artykuły.')
    return
  }

  if (id) {
    const { error } = await supabase
      .from('zadanie_13')
      .update({ title, subtitle, content, author, created_at })
      .eq('id', id)
      .eq('user_id', currentUser.id)

    if (error) {
      alert('Błąd aktualizacji: ' + error.message)
      return
    }
  } else {
    const { error } = await supabase
      .from('zadanie_13')
      .insert([{ title, subtitle, content, author, created_at, user_id: currentUser.id }])

    if (error) {
      alert('Błąd dodawania: ' + error.message)
      return
    }
  }

  articleModal.classList.add('hidden')
  loadArticles()
})

async function deleteArticle(id) {
  if (!confirm('Na pewno chcesz usunąć ten artykuł?')) return

  const { error } = await supabase
    .from('zadanie_13')
    .delete()
    .eq('id', id)
    .eq('user_id', currentUser.id)

  if (error) {
    alert('Błąd usuwania: ' + error.message)
    return
  }

  loadArticles()
}

btnLogout.onclick = async () => {
  await supabase.auth.signOut()
  window.location.href = '/login/'
}

btnAddArticle.onclick = () => openEditModal()

async function init() {
  await checkUser()
  await loadArticles()
}

init()

