document.addEventListener('DOMContentLoaded', () => {
  const postForm = document.getElementById("postForm");
  const postContent = document.getElementById("postContent");
  const postsContainer = document.getElementById("posts");
  const logoutBtn = document.getElementById("logoutBtn");

  let currentUser = null;


//cheking login status

  fetch('/login-status', { credentials: 'include' })
    .then(res => {
      if (!res.ok) throw new Error('Not logged in');
      return res.json();
    })
    .then(data => {


      // adding user name to the page
      currentUser = data.username;
      document.querySelector('.container').insertAdjacentHTML('afterbegin', `<p id="userName"><svg id="svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>${currentUser}</p>`);
      loadPosts();
    })
    .catch(() => {
      window.location.href = '/login.html'; 
    });



  // loading posts
  function loadPosts() {
    fetch('/posts', { credentials: 'include' })
      .then(res => res.json())
      .then(posts => {
        postsContainer.innerHTML = '';
        posts.forEach(post => {
          const div = document.createElement('div');
          div.className = 'posts';
          div.textContent = post.content;

          const divContainer = document.createElement('div');

          
          // EditButton 
          const editBtn = document.createElement('button');

          editBtn.style.marginLeft = '10px';
          editBtn.textContent = 'Edit';
          editBtn.onclick = () => editPost(post.id, div);

          // DeleteButton
          const deleteBtn = document.createElement('button');
          deleteBtn.style.marginLeft = '10px';
          deleteBtn.textContent = 'Delete';
          deleteBtn.onclick = () => deletePost(post.id);

          // Appending elements to post
          div.appendChild(divContainer);
          divContainer.appendChild(editBtn);
          divContainer.appendChild(deleteBtn);
          postsContainer.appendChild(div);
        });
      });
  }


  // Edit Function
  function editPost(postId, postDiv) {
    const currentText = postDiv.firstChild.textContent;
    const textarea = document.createElement('input');
    textarea.type = 'text';
    textarea.value = currentText;

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.onclick = () => {
      const newContent = textarea.value.trim();
      if (!newContent) return alert('Content cannot be empty');

      fetch(`/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: newContent })
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to update');
          return res.json();
        })
        .then(() => loadPosts())
        .catch(err => alert(err.message));
    };

    postDiv.innerHTML = '';
    postDiv.appendChild(textarea);
    postDiv.appendChild(saveBtn);
  }


  // Delete Function
  function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    fetch(`/posts/${postId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete');
        return res.json();
      })
      .then(() => loadPosts())
      .catch(err => alert(err.message));
  }


  // Post submission
  postForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const content = postContent.value.trim();
    if (!content) return;

    fetch('/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to post');
        return res.json();
      })
      .then(() => {
        postContent.value = '';
        loadPosts();
      })
      .catch(err => alert(err.message));
  });


  //logout function 
  logoutBtn.addEventListener('click', () => {
    fetch('/logout', { credentials: 'include' })
      .then(() => window.location.href = '/login.html');
  });
});








