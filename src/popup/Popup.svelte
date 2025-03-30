<script>
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "$lib/components/ui/card";
  
  // Write your popup logic here
  let title = "Pro Tabs";
</script>

<main class="bg-background">
  <Card class="w-[300px] shadow-none border-0">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>생산성을 높이는 새 탭 확장 프로그램</CardDescription>
    </CardHeader>
    <CardContent>
      <Button 
        variant="default" 
        class="w-full" 
        on:click={() => alert('Pro Tabs에 오신 것을 환영합니다!')}
      >
        클릭하세요
      </Button>
    </CardContent>
  </Card>
</main> 