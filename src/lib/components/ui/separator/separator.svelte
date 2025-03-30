<script lang="ts">
  import { cn } from "$lib/utils";
  import { getContext } from "svelte";

  export let orientation: "horizontal" | "vertical" = "horizontal";
  export let decorative = false;
  export let class_name = "";
  export let class_value = "";

  $: orientationClass = orientation === "horizontal" ? "h-px w-full" : "h-full w-px";
</script>

<div
  class={cn(
    "shrink-0 bg-border",
    orientationClass,
    class_name,
    class_value,
    $$props.class
  )}
  role={decorative ? "none" : "separator"}
  aria-orientation={orientation}
  data-orientation={orientation}
  data-testid="separator"
/> 