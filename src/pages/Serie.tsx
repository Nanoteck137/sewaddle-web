import { useParams } from "@solidjs/router";

const Serie = () => {
  const params = useParams<{ id: string }>();
  return <p>Series page: {params.id}</p>;
};

export default Serie;
