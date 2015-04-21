var countModel = new CountModel();

var testView = new Barista.Views.GenericCountView({
  el: $('#box'),
  label: 'Signatures',
  model: countModel,
  fg_color: '#0B609A',
  top_bar_color: 'white',
  plot_height: 70,
  png: false
});
