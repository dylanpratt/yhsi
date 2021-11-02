import { api } from './config';

  export default {
  async getCommunities(){
    return await api.get(`catalogs/community`)
    .then(res => {
      return res.data;
    }).catch(error =>{
      // handle error
      console.log(error);
    });
  },
  async getOriginalMedia(){
    return await api.get(`catalogs/originalmedia`)
    .then(res => {
      return res.data;
    }).catch(error =>{
      // handle error
      console.log(error);
    });
  },
  async getVesselTypes(page, limit, textToMatch,sortBy, sort){
    return await api.get(`catalogs/vesseltype`,{
      crossdomain: true,
      params: {
        page,
        limit,
        textToMatch,
        sortBy,
        sort
      }})
    .then(res => {
      return res.data;
    }).catch(error =>{
      // handle error
      console.log(error);
    });
  },
  async postVesselType(data){
    return await api.post(`catalogs/vesseltype/new`,data)
    .then(res => {
      return res.data;
    }).catch(error =>{
      // handle error
      console.log(error);
    });
  },
  async putVesselType(id,data){
    return await api.put(`catalogs/vesseltype/${id}`,data)
    .then(res => {
      return res.data;
    }).catch(error =>{
      // handle error
      console.log(error);
    });
  },
} 