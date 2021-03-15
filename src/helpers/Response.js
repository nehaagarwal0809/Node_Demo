"use strict";

var exportFuns = {};

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

exportFuns.send = (req, res, status, message, data = {}) => {
  if (status == 500) {
    data = {
      message: message,
      method: req.method,
      //headers: req.headers,
      status: status,
      body: req.body,
      params: req.params,
      query: req.query,
      //files: req.files,
    };
  }

  var resObj = {
    status: status,
    message: message,
    data: data,
  };
  res.status(status).json(resObj);
  return;
};

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

module.exports = exportFuns;
