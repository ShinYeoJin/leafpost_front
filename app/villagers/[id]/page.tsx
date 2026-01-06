import VillagerCard from "@/components/villagers/VillagerCard";

type PageProps = {
  params: {
    id: string;
  };
};

export default function VillagerDetailPage({ params }: PageProps) {
  const villagerId = params.id;

  return (
    <div className="container">
      <div className="content">
        <div className="villager-section">
          <VillagerCard
            name=""
            imageUrl=""
            isPopular={false}
            exampleSentence=""
          />
        </div>
      </div>
    </div>
  );
}

