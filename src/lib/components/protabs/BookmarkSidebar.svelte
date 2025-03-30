<script>
  // 즐겨찾기 링크 데이터
  export let bookmarks = [
    { name: "Google", url: "https://google.com" },
    { name: "GitHub", url: "https://github.com" },
    { name: "YouTube", url: "https://youtube.com" },
    { name: "Gmail", url: "https://mail.google.com" },
    { name: "Naver", url: "https://naver.com" }
  ];
</script>

<aside class="w-64 p-4 border-r">
  <h2 class="font-semibold text-lg mb-4">즐겨찾기</h2>
  <ul class="space-y-2">
    {#each bookmarks as bookmark}
      <li>
        <a 
          href={bookmark.url}
          class="flex items-center p-2 hover:bg-muted rounded-md transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div class="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full mr-2">
            {bookmark.name[0]}
          </div>
          <span>{bookmark.name}</span>
        </a>
      </li>
    {/each}
  </ul>
</aside> 