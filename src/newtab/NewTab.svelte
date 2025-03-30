<script>
  // 컴포넌트 임포트
  import Header from "$lib/components/protabs/Header.svelte";
  import Footer from "$lib/components/protabs/Footer.svelte";
  import BookmarkSidebar from "$lib/components/protabs/BookmarkSidebar.svelte";
  import Clock from "$lib/components/protabs/Clock.svelte";
  import UtilsSidebar from "$lib/components/protabs/UtilsSidebar.svelte";
  
  // 데이터 상태
  let weather = { condition: "로딩 중...", temperature: "", location: "" };
  let bookmarks = [
    { name: "Google", url: "https://google.com" },
    { name: "GitHub", url: "https://github.com" },
    { name: "YouTube", url: "https://youtube.com" },
    { name: "Gmail", url: "https://mail.google.com" },
    { name: "Naver", url: "https://naver.com" }
  ];
  let todos = [
    { id: 1, text: "Pro Tabs 개발하기", completed: false },
    { id: 2, text: "메인 화면 디자인", completed: true },
    { id: 3, text: "날씨 API 연동", completed: false }
  ];
  let memo = "";
</script>

<div class="min-h-screen flex flex-col bg-background text-foreground overflow-hidden">
  <!-- 헤더 영역 -->
  <Header {weather} />
  
  <!-- 메인 콘텐츠 영역 -->
  <main class="flex-1 flex overflow-auto">
    <!-- 왼쪽 사이드바 - 즐겨찾기 -->
    <BookmarkSidebar {bookmarks} />
    
    <!-- 중앙 영역 - 시계와 날짜 -->
    <Clock />
    
    <!-- 오른쪽 사이드바 - 메모와 TODO -->
    <UtilsSidebar {todos} bind:memo />
  </main>
  
  <!-- 푸터 영역 -->
  <Footer />
</div>