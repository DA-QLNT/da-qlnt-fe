import { useMemo } from "react";
import { useGetHouseServicesByHouseIdQuery } from "../store/serviceApi";

export const useHouseServiceData = (houseId, serviceId) => {
  const {
    data: houseServices,
    isLoading,
    isFetching,
  } = useGetHouseServicesByHouseIdQuery(houseId, {
    skip: !houseId,
  });
  const serviceInfo = useMemo(() => {
    if (!houseServices || !serviceId) {
      return { price: null, effectiveDate: null, method:null };
    }
    const targetService = houseServices.find(
      (service) => service.serviceId === serviceId
    );
    return {
      price: targetService?.price,
      effectiveDate: targetService?.effectiveDate,
      method: targetService?.method,
    };
  }, [houseServices, serviceId]);
  return {
    ...serviceInfo,
    isLoading: isLoading || isFetching,
  };
};
