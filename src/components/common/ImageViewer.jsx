import { Card, CardContent } from "@/components/ui/card";

export const AssetImageViewer = ({ imageUrl }) => {
  if (!imageUrl) return null;
  return (
    <Card className="p-2 w-[250px] sm:w-[350px] md:w-[400px]">
      <CardContent className="p-0">
        <img
          src={imageUrl}
          alt="Asset Item Image"
          className="w-full object-contain rounded-md"
        />
      </CardContent>
    </Card>
  );
};
