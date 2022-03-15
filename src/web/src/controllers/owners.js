import { api } from './config';

export default {
  async get(page, limit, textToMatch, sortBy, sort) {
    return await api.get(`owners`, {
      params: {
        page,
        limit,
        textToMatch,
        sortBy,
        sort
      }
    })
      .then(res => {
        return res.data;
      }).catch(error => {
        // handle error
        //console.log(error);
      });
  },
  async getById(id) {
    return await api.get(`owners/${id}`)
      .then(res => {
        return res.data;
      }).catch(error => {
        // handle error
        //console.log(error);
      });
  },
  async put(id, data) {
    return await api.put(`owners/${id}`, data)
      .then(res => {
        return res.data;
      }).catch(error => {
        // handle error
        //console.log(error);
      });
  },
  async post(data) {
    return await api.post(`owners`, data)
      .then(res => {
        return res.data;
      }).catch(error => {
        // handle error
        //console.log(error);
      });
  },
  async getGridPdf(){
    return await api({
      url: 'owners/pdf',
      method: 'POST',
      responseType: 'blob',
    })
    .then( res => {
      return res.data;
    }).catch( err => {
      return err;
    })
  },
  async getExport() {
    return await api.post(`owners/export`)
      .then(res => {
        return res.data;
      }).catch(error => {
        // handle error
        //console.log(error);
      });
  }
}
