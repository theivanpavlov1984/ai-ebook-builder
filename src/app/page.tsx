import { ContinueCard } from "@/components/home/ContinueCard";
import { ExampleShelf } from "@/components/home/ExampleShelf";
import { StartForm } from "@/components/home/StartForm";
import { AppShell } from "@/components/shell/AppShell";

export default function Home() {
  return (
    <AppShell active="new">
      <div className="mx-auto grid max-w-[1080px] grid-cols-[minmax(0,1fr)_auto] items-center gap-16 px-10 py-16">
        <div className="flex max-w-xl flex-col gap-8">
          <div>
            <h1 className="font-display text-3xl font-medium">Turn what you know into a book.</h1>
            <p className="mt-3 text-md text-secondary">
              Describe your idea – Primer writes, designs and lays out a short eBook you’ll be proud to share. About five
              minutes, no writing or design skills needed.
            </p>
          </div>
          <StartForm />
          <ContinueCard />
        </div>
        <ExampleShelf />
      </div>
    </AppShell>
  );
}
