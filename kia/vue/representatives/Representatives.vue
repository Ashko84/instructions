<template>
  <div class="representative-wrap">
    <div class="section locator row">
      <div class="locator-menu">

        <div id="locator_left-side" class="padding-none bg_lite_gray">

          <div v-html="networkFilters"></div>

          <div class="col-xs-12 margin-none locations" id="representatives_list_wrapper">

            <div class="representatives_list list-new row" style="display:block;">
            </div>
            <div class="clearfix"></div>

          </div>
        </div>

        <div style="_height: 981px;" id="representativesMap"></div>

        <div class="clearfix"></div>

      </div>

    </div>

  </div>
</template>

<script>
export default {
  name: 'Representatives',
  props: ['paramData','serviceUrl', 'translationData', 'networkFilters', 'contactData'],
  data() {
    return {
      params:null,
      jsTranslations:null,
      toggleVisible:false,
      filterVisible:false,
      filterClicked:false,
      onlyRegions:false,
      foundWordsWithWeekend:false,
      toggleItems:[],
      presentRepList:[],
      testCouponList:[],
      allItems:[],
      emptyRep:[],
      filtersBlock:null,
      defaultOptions: { lat: '46.0936711102', lng: '14.8334422197' },
      mapStyle: [
        {
          featureType: 'landscape.man_made',
          elementType: 'geometry',
          stylers: [{ color: '#f7f1df' }]
        },
        {
          featureType: 'landscape.natural',
          elementType: 'geometry',
          stylers: [{ color: '#d0e3b4' }]
        },
        {
          featureType: 'landscape.natural.terrain',
          elementType: 'geometry',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'poi.business',
          elementType: 'all',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'poi.medical',
          elementType: 'geometry',
          stylers: [{ color: '#fbd3da' }]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{ color: '#bde6ab' }]
        },
        {
          featureType: 'road',
          elementType: 'geometry.stroke',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.fill',
          stylers: [{ color: '#ffe15f' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#efd151' }]
        },
        {
          featureType: 'road.arterial',
          elementType: 'geometry.fill',
          stylers: [{ color: '#ffffff' }]
        },
        {
          featureType: 'road.local',
          elementType: 'geometry.fill',
          stylers: [{ color: 'black' }]
        },
        {
          featureType: 'transit.station.airport',
          elementType: 'geometry.fill',
          stylers: [{ color: '#cfb2db' }]
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#a2daf2' }]
        }
      ],
      clusterOptions:{
        imagePath:
            'https://www.kmag.net/sharedcakephp/kia2/img/representative_network/m',
        styles: [
          {
            url:
                'https://www.kmag.net/sharedcakephp/kia2/img/representative_network/m1.png',
            width: 53,
            height: 53,
            textSize: 15,
            textColor: '#fff'
          }
        ]
      },
      config: {
        ajax_rep_list_by_location:
            '/servisna_mreza/getRepresentativeListByLocation',
        ajax_rep_list: '/servisna_mreza/getRepresentativeList',
        service_url: '/servis',
        init_data: null
      },
      filters: [],
      certificate_descript: [],
      stat: {
        rep_list: [],
        coupon_list: []
      },
      el_item: null,
      mainHolder: null,
      loading:false,
    };
  },
  methods:{

    showRepresentativeMap(
        holder,
        latitude,
        longitude,
        zoom,
        element,
        opt_obj
    ) {
      if (opt_obj == null){
        opt_obj = { autocenter: false, autoZoom: false }
      }
      opt_obj.mapOptions = opt_obj.mapOptions || {};
      opt_obj.infoBox = opt_obj.infoBox || {};

      let default_opt = this.defaultOptions;
      let map_style = this.mapStyle;
      let holderDiv = document.getElementById(holder);

      if (typeof(holderDiv) !== 'undefined' && holderDiv !== null) {
        if (!zoom) zoom = 9;
        if (!latitude) latitude = default_opt.lat;
        if (!longitude) longitude = default_opt.lng;
        let mapOptions = {
          zoom: zoom,
          scrollwheel: false,
          disableDoubleClickZoom: false,
          draggable: true,
          center: new google.maps.LatLng(latitude, longitude),
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: map_style
        };
        if (document.body.classList.contains('lg-view')) {
          mapOptions = {
            zoom: zoom,
            scrollwheel: false,
            disableDoubleClickZoom: false,
            draggable: true,
            center: new google.maps.LatLng(latitude, longitude),
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: map_style
          };
        }

        mapOptions = this.extend({}, mapOptions, opt_obj.mapOptions);
        let map = new google.maps.Map(document.getElementById(holder), mapOptions);


        if(Array.isArray(element)){
          this.allItems = element;
        }else{
          this.allItems = document.querySelectorAll(element);
        }


        if(this.allItems !== null){
          let bounds = new google.maps.LatLngBounds();
          let markers = [];

          this.allItems.forEach((rep, index) => {
            let repLat = rep.getAttribute('data-gmaps_lat');
            let repLng = rep.getAttribute('data-gmaps_lng');
            let gmapInfo = rep.getAttribute('data-gmaps_infowindow');
            let marker = new google.maps.Marker({
              position: new google.maps.LatLng(repLat, repLng),
              clickable: true,
              map: map,
              icon: '//kmag.net/sharedcakephp/kia2/img/representative_network/kia_pin.png'
            });


            let infoWindow = new InfoBox({
              content: gmapInfo,
              boxClass: 'popupWindow',
              main_holder_el: opt_obj.infoBox.main_holder_el,
              infoBoxClearance: new google.maps.Size(10, -50),
              pixelOffset: new google.maps.Size(-210, -50),
              closeBoxMargin: '2px',
              closeBoxURL:
                  '//kmag.net/sharedcakephp/kia2/img/icons/icon-x-white.svg',
              alignBottom: true,
              maxWidth: 420,
              disableAutoPan: false,
              closeBoxClass: 'InfoBoxCloseButton'
            });

            //Add marker
            google.maps.event.addListener(marker, 'click', () => {
              infoWindow.open(map, marker);
            });

            bounds.extend(marker.position);
            markers.push(marker);
          });

          map.addListener('click', () => {
            document.querySelector('.popupWindow:not([hidden])').style.display = 'none';
          });


          let clusterOptions = {
            imagePath:
                'https://www.kmag.net/sharedcakephp/kia2/img/representative_network/m',
            styles: [
              {
                url:
                    'https://www.kmag.net/sharedcakephp/kia2/img/representative_network/m1.png',
                width: 53,
                height: 53,
                textSize: 15,
                textColor: '#fff'
              }
            ]
          };


          let markerCluster = new MarkerClusterer(map, markers, clusterOptions);


          google.maps.event.addDomListener(window, 'resize', function() {
            map.setCenter(map.getCenter());
          });

          if (opt_obj.autocenter){
            map.setCenter(bounds.getCenter());
          }

          if (opt_obj.autoZoom){
            map.fitBounds(bounds);
          }
        } else {
          alert(`Missing element: ${element}`);
        }
      }
    },

    isElement(element) {
      return element instanceof Element || element instanceof HTMLDivElement;
    },



    extend() {

      let extended = {};
      let deep = false;
      let i = 0;
      let length = arguments.length;

      if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
        deep = arguments[0];
        i++;
      }

      let merge = function (obj) {
        for ( let prop in obj ) {
          if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
            // If deep merge and property is an object, merge properties
            if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
              extended[prop] = extend( true, extended[prop], obj[prop] );
            } else {
              extended[prop] = obj[prop];
            }
          }
        }
      };

      for ( ; i < length; i++ ) {
        let obj = arguments[i];
        merge(obj);
      }
      return extended;
    },


    mapLocation(conf_obj) {
      let defaultConfObj = {
        lat: 46.0936711102,
        lng: 14.8334422197,
        zoom: 8,
        autocenter: 1,
        autoZoom: 1,
        mapOptions: {},
        element: '.locator-menu .locations .item'
      };

      conf_obj = this.extend({}, defaultConfObj, conf_obj);
      let allItems = document.querySelectorAll('.locator-menu .locations .item');


      if(allItems !== null){
        this.showRepresentativeMap(
            'representativesMap',
            parseFloat(conf_obj.lat),
            parseFloat(conf_obj.lng),
            conf_obj.zoom,
            conf_obj.element,
            {
              autocenter: conf_obj.autocenter,
              autoZoom: conf_obj.autoZoom,
              mapOptions: conf_obj.mapOptions,
              infoBox: conf_obj.infoBox
            }
        );
      }
    },

    resizeFilterList(sw) {
      let filter_list_size =
          document.querySelector('.locator-menu').outerHeight -
          (document.querySelector('#search_bar').outerHeight +
              document.querySelector('#wrapper_service_filters .filter_confirm_section').outerHeight);
      let filter_list_path = '#wrapper_service_filters form';

      let smFloater = document.querySelector('#servicemaxx .over-floater');
      let smOuterHeight = 0;
      if(smFloater !== null){
        smOuterHeight = smFloater.outerHeight;
      }else{
        smOuterHeight = 0;
      }

      let searcherAhead_height =
          document.querySelector('#search_bar').outerHeight +
          document.querySelector('#filter_bar').outerHeight +
          smOuterHeight;
      let searcherAhead_height_string =
          'calc(100vh - ' + searcherAhead_height + 'px)';
      let list_path = '#representatives_list_wrapper';

      if (sw) {
        document.querySelector(list_path).style.height = searcherAhead_height_string;
      } else {
        document.querySelector(filter_list_path).style.maxHeight = filter_list_size;
        document.querySelector(filter_list_path).style.overflowY = 'auto';
      }
    },

    init(config, data) {
      this.mainHolder = document.body;
      this.config = this.extend({}, this.config, config);

      let _json_data = document.querySelector('#json_data_holder');
      this.config.app_translations = JSON.parse(
          _json_data.getAttribute('data-appTranslation')
      );
      this.config.translations = data.translations;

      this.config.init_data = JSON.parse(_json_data.getAttribute('data-init-data'));

      this.el_item = document.querySelector('#row_item_map');

      this.getRepList();
      this.eventsOnMainButtons();

      let params = DTools.getAllUrlParams(window.location.search);

      this.filtersSelectAuto(params.filter);

      this.eventsCertificateClick();
    },

    represDetails(analyticsText){
      try{
        DAnalyticsScripts.representativeNetwork_repres_details(analyticsText)
      }catch (err){
        console.log(err)
      }
    },

    htmlInfowindow(data) {

      let workHoursSale = '';
      let workHoursService = '';

      if (data.work_hours.sale != null) {
        workHoursSale = `<div class="work_hours"><strong>${this.config.translations.representative_rep_wtime_sale}</strong> ${data.work_hours.sale.description_long.replace(/'/g, '"')}<div class="clearfix"></div></div>`
      }else{
        workHoursSale = '';
      }

      if (data.work_hours.service != null) {
        workHoursService = `<div class="work_hours"><strong>${this.config.translations.representative_rep_wtime_service}</strong> ${data.work_hours.service.description_long.replace(/'/g, '"')}<div class="clearfix"></div></div>`
      }else{
        workHoursService = '';
      }

      return `
      <div class="title"><span class="city_name">${data.citys.name}</span> - ${data.representatives.name}</div>
      <div class="address">${data.representatives.address} ${data.citys.postal_code} ${data.citys.name}</div>
      ${workHoursSale}
      ${workHoursService}
      <div class="details"><a class="info-window-details" onclick="represDetails(data.citys.name + data.representatives.name)" href="${data.url}">
      ${this.config.translations.show_details}</a></div>
      <div class="clearfix"></div>
      `;
    },


    htmlItemElement(data) {
      let _el = this.el_item.cloneNode(true);

      let _callableNum = data.representatives.phone
          .split(' ')[0]
          .replace(',', '');

      let _item_rep_sales = '';
      let _item_rep_service = '';

      if(_el.querySelector('._item_toggle_btn_representative_name') !== null){
        _el.querySelector('._item_toggle_btn_representative_name').innerHTML =
            `<div><span class="city_name">${data.citys.name}</span> - ${data.representatives.name}</div>`;
      }

      if(_el.querySelector('._item_representative_name') !== null){
        _el.querySelector('._item_representative_name').innerHTML = `<div  onclick="location.href='${data.url}'"><span class="city_name">${data.citys.name}</span> - ${data.representatives.name}</div>`;
      }

      if(_el.querySelector('._item_representative_tel_address') !== null){
        _el.querySelector('._item_representative_tel_address').innerHTML =
            `<div onclick="location.href='${data.url}'>">${data.representatives.address}, ${data.citys.postal_code} ${data.citys.name}</div>`;
      }

      if(_el.querySelector('._item_representative_tel') !== null){
        _el.querySelector('._item_representative_tel').innerHTML =
            `<div onclick="location.href='${data.url}'"><a class="visible-xs" href="tel:${_callableNum}">T: ${data.representatives.phone}</a><span class="hidden-xs data_wrapper"><span class="data_tag">T:</span> <span class="data_var">${data.representatives.phone.replace(', ', '<br/>')}</span></span></div>`;
      }

      if(_el.querySelector('._item_representative_tel_2') !== null){
        _el.querySelector('._item_representative_tel_2').innerHTML =
            `<div onclick="location.href="'${data.url}'"><a class="visible-xs" href="tel:${_callableNum}">T: ${data.representatives.phone2}</a><span class="hidden-xs data_wrapper"><span class="data_tag">T:</span> <span class="data_var">${data.representatives.phone2.replace(', ', '<br/>')}</span></span></div>`;
      }

      if(_el.querySelector('._item_representative_tel_3') !== null){
        _el.querySelector('._item_representative_tel_3').innerHTML = `<div onclick="location.href='${data.url}'"><a class="visible-xs" href="tel:${_callableNum}">${data.representatives.phone3}</a><span class="hidden-xs">${data.representatives.phone3}</span></div>`;
      }

      if(_el.querySelector('._item_representative_email_sale') !== null){
        _el.querySelector('._item_representative_email_sale').innerHTML =
            `<div onclick="location.href='${data.url}'"><a class="visible-xs" href="tel:${_callableNum}">${data.representatives.email_sale}</a><span class="hidden-xs data_wrapper"><span class="data_tag">E:</span> <span class="data_var">${data.representatives.email_sale}</span></span></div>`;
      }

      if(_el.querySelector('._item_representative_email_service') !== null){
        _el.querySelector('._item_representative_email_service').innerHTML =
            `<div onclick="location.href='${data.url}'"><a class="visible-xs" href="tel:${_callableNum}">${data.representatives.email_service}</a><span class="hidden-xs data_wrapper"><span class="data_tag">E:</span> <span class="data_var">${data.representatives.email_service}</span></span></div>`;
      }

      if(_el.querySelector('._item_representative_email_boutique') !== null){
        _el.querySelector('._item_representative_email_boutique').innerHTML =
            `<div onclick="location.href='${data.url}'"><a class="visible-xs" href="tel:${_callableNum}">${data.representatives.email_boutique}</a><span class="hidden-xs">${data.representatives.email_boutique}</span></div>`;
      }


      if (
          data.representatives.phone.length > 1 ||
          data.representatives.email_sale.length > 1
      ) {
        _item_rep_sales += `<div class="data_title"><strong>${this.config.translations.representative_rep_wtime_sale}</strong></div>`;
      }

      if (data.representatives.phone.length > 1) {
        _item_rep_sales += `<div class="item_representative_sales_tel"><span class="data_wrapper"><span class="data_tag">T:</span><a href="tel:${data.representatives.phone.replace(/[^0-9$.,]/g, '').replace(',', '" note="')}"><span class="data_var">${data.representatives.phone.replace(', ', '<br/>')}</a></span></span></div>`;
      }

      if (data.representatives.email_sale.length > 1) {
        _item_rep_sales += `<div class="item_representative_sales_mail"><span class="data_wrapper"><span class="data_tag">M:</span> <a href="mailto:${data.representatives.email_sale.replace(', ', '" note="')}"><span class="data_var">${data.representatives.email_sale.replace(', ', '<br/>')}</span></a></span></div>`;
      }

      if(_el.querySelector('._item_representative_sales') !== null){
        _el.querySelector('._item_representative_sales').innerHTML = _item_rep_sales;
      }

      if (
          data.representatives.phone2.length > 1 ||
          data.representatives.email_service.length > 1
      ) {
        _item_rep_service += `<div class="data_title"><strong>${this.config.translations.representative_rep_wtime_service}</strong></div>`;
      }

      if (data.representatives.phone2.length > 1) {
        _item_rep_service += `<div class="item_representative_sales_tel"><span class="data_wrapper"><span class="data_tag">T:</span><a href="tel:${data.representatives.phone2.replace(/[^0-9$.,]/g, '').replace(',', '" note="')}"><span class="data_var">${data.representatives.phone2.replace(', ', '<br/>')}</span></a></span></div>`;
      }

      if (data.representatives.email_service.length > 1) {
        _item_rep_service += `<div class="item_representative_sales_mail"><span class="data_wrapper"><span class="data_tag">M:</span> <a href="mailto:${data.representatives.email_sale.replace(', ', '<br/>')}"><span class="data_var">${data.representatives.email_service.replace(', ', '<br/>')}</span></a></span></div>`;
      }

      if( _el.querySelector('._item_representative_service') !== null){
        _el.querySelector('._item_representative_service').innerHTML = _item_rep_service;
      }

      let _html = '';

      if (typeof data.work_hours.sale != 'undefined'){
        _html += `<b>${this.config.translations.representative_rep_wtime_sale}:</b><br/>${data.work_hours.sale.description_long}`;
      }

      if (typeof data.work_hours.service != 'undefined'){
        _html += `<b>${this.config.translations.representative_rep_wtime_service}:</b><br/>${data.work_hours.service.description_long}`;
      }


      if (_html !== '') {
        if(_el.querySelector('._item_representative_work_time') !== null){
          _el.querySelector('._item_representative_work_time').innerHTML = _html;
        }
      }

      if(_el.querySelector('._item_representative_link_coupons') !== null)
      {
        _el.querySelector('._item_representative_link_coupons').innerHTML =
            `<a href="#">${this.config.translations.show_coupons}</a>`;
      }

      if( _el.querySelector('._item_representative_li' +
          'nk_map') !== null)
      {
        _el.querySelector('._item_representative_li' +
            'nk_map').innerHTML =
            `<a style="cursor:pointer" class="button-medium gray item_map_link" data-gmaps_lng="${data.representatives.gmaps_lng}" data-gmaps_lat="${data.representatives.gmaps_lat}">${this.config.translations.show_on_map}</a>`;
      }

      if(_el.querySelector('._item_representative_link_details') !== null)
      {
        _el.querySelector('._item_representative_link_details').innerHTML =
            `<a class="button-medium" href="${data.url}">${this.config.translations.show_details}</a>`;
      }

      if (data.representatives.premium_sale === 1){
        _el.querySelector('._item_representative_premium_sale').innerHTML = this.config.translations.premium_sale;
      }

      if (data.representatives.premium_service === 1){
        _el.querySelector('._item_representative_premium_service').innerHTML = this.config.translations.premium_service;
      }

      if (data.representatives.service_active){
        if(_el.querySelector('._item_representative_service_btn') !== null)
        {
          _el.querySelector('._item_representative_service_btn').innerHTML =
              `<a class="btn btn-cta-red" href="${this.config.service_url}?representative_id=${data.representatives.representative_id}">${this.config.translations.btn_service}</a>`;
        }
      } else{
        if(_el.querySelector('._item_representative_service_btn') !== null)
        {
          _el.querySelector('._item_representative_service_btn').classList.add('hide')
        }
      }

      if(_el.querySelector('.item_badge .item_badge_num') !== null){
        _el.querySelector('.item_badge .item_badge_num').innerHTML = data.pin_index;
        /*_el.appendChild(document.createElement('\'<div class="clearfix"></div>\''));*/
      }

      return _el.innerHTML;
    },

    afterRenderItems(first_time) {
      first_time = first_time == null ? false : first_time;

      this.loadFilters();
      this.eventsOnItem();
      this.mapLocation();

      if (first_time) {
        this.eventsFilters(this.config.init_data.filter_on_start);
        this.removeFilter();
      } else {
        this.removeFilter();
      }
    },

    renderItems() {

      let main_el = document.querySelector('#representatives_list_wrapper .representatives_list.list-new');
      main_el.innerHTML = '';

      let counts_results = 0;
      let pin_index = 0;

      this.presentRepList.forEach((element, index) => {
        if(element !== null) {
          if (element.representatives === null || !element.display) {
            return true;
          }

          pin_index++;
          element.pin_index = pin_index;

          let item_element = this.htmlItemElement(element);
          let htmlInfowindow = this.htmlInfowindow(element);

          let innerContent = document.createElement('div');
          innerContent.className = 'item col-xs-12 col-sm-12 hover';
          innerContent.setAttribute('data-search', element.data_search);
          innerContent.setAttribute('data-id', element.representatives.representative_id);
          innerContent.setAttribute('data-ele-index', pin_index);
          innerContent.setAttribute('data-gmaps_id', element.representatives.representative_id);
          innerContent.setAttribute('data-gmaps_title', element.citys.name);
          innerContent.setAttribute('data-gmaps_lat', element.representatives.gmaps_lat);
          innerContent.setAttribute('data-gmaps_lng', element.representatives.gmaps_lng);
          innerContent.setAttribute('data-gmaps_infowindow', htmlInfowindow);
          innerContent.innerHTML = item_element;

          let clearFix = document.createElement('div');
          clearFix.className = 'clearfix';


          main_el.appendChild(innerContent);
          if (pin_index % 2 === 0) {
            main_el.appendChild(clearFix);
          }
          counts_results++;
        }
      });
      if (counts_results < 1) {
        main_el.appendChild(this.renderNoResults());
      }
      this.eventToggleItem();
    },

    renderNoResults() {
      let noResults = document.createElement('div');
      let noResultsInner = `<p>${this.config.translations.no_results}</p><a class="btn" id="searchNearestRep">${this.config.translations.search_nearest_repr}</a><a class="btn" id="searchByInputLocation">${this.config.translations.cta_search_by_city_name}</a>`;
      noResults.className = 'no-results';
      noResults.innerHTML = noResultsInner;
      return noResults;
    },

    renderFilterTags() {
      let el = document.querySelector('.locator #form_filter_data');
      let _html = '';
      let _texting = '';
      let _text_el = null;

      this.filters.forEach(item => {
        _text_el = el.querySelector(
            'input.input_filter_checkbox[name="' + item.name + '"]'
        );
        if(_text_el !== null){
          if (_text_el.getAttribute('data-filter-title')) {
            _texting = _text_el.getAttribute('data-filter-title');
          } else {
            _texting = _text_el.nextElementSibling.innerHTML;
          }
        }
        _html += `<a data-selector="${item.name}" class="btn">${_texting}<span class="glyphicon glyphicon-remove"></span></a>`;
      });

      document.querySelector('.locator #wrapper_selected_filters').innerHTML = _html;
      const filtersAdded = document.querySelector('.locator #filters_added');

      if(filtersAdded !== null){
        if (_html.length){
          filtersAdded.classList.add('filters-added');
        }
        else {
          filtersAdded.classList.remove('filters-added');
        }
      }
    },

    quickRepresentFilter(data) {
      if (data == null){
        data = { filter_on_start: '' };
      }
      let _repres_name = document.querySelector("input[name='data[Form][location_name]']").value;
      _repres_name = _repres_name.toLowerCase();
      this.presentRepList.forEach((v, k) => {
        if (v == null) return true;
        if (v.data_search.indexOf(_repres_name) === -1) {
          this.presentRepList[k].display = 0;
        }
        else {
          this.presentRepList[k].display = 1;
        }
      });
      this.renderItems();
      this.eventsOnItem();
    },

    sliderButton(sliderInput) {
      if (sliderInput.checked){
        sliderInput.closest('label.switch').classList.add('checked');
      }
      else{
        sliderInput.closest('label.switch').classList.remove('checked');
      }
    },

    checkUncheck() {
      let allCheckboxes = document.querySelectorAll(".filter_box .check_low");
      allCheckboxes.forEach(item => {
        item.addEventListener('click', () => {
          item.closest('.filter_box').classList.toggle('checked')
        });
      })
    },



    toggleServiceFilters() {

      let filterBar = document.getElementById('filter_bar');
      let locatorLeftSide = document.getElementById('locator_left-side');
      let serviceFilters = document.getElementById('wrapper_service_filters');
      let locations = document.querySelector('#locator_left-side .locations');

      if(this.filterVisible){
        filterBar.style.display = 'none';
        serviceFilters.style.display = 'block';
        this.helperScrollTop();
        let locatorRect = locatorLeftSide.getBoundingClientRect();
        let locatorOffset = {
          top: locatorRect.top + window.scrollY,
          left: locatorRect.left + window.scrollX
        }
        this.scrollIt(locatorOffset.top, 600, 'easeOutQuad');
        locatorLeftSide.classList.add('display_representative_filters');
        locations.style.display = 'none';
        this.resizeFilterList(false);
        document.body.classList.add('representatives_filters_activated');
      } else{
        serviceFilters.style.display = 'none';
        this.helperScrollTop();
        let locatorRect = locatorLeftSide.getBoundingClientRect();
        let locatorOffset = {
          top: locatorRect.top + window.scrollY,
          left: locatorRect.left + window.scrollX
        }
        this.scrollIt(locatorOffset.top, 600, 'easeOutQuad');
        filterBar.style.display = 'block';
        locatorLeftSide.classList.remove('display_representatives_filters');
        locations.style.display = 'block';
        this.resizeFilterList(true);
        document.body.classList.remove('representatives_filters_activated');
      }
    },

    serializeArray(form) {// Setup our serialized data
      var arr = [];
      Array.prototype.slice.call(form.elements).forEach((field, fieldIndex) => {
        if (field.checked){
          arr.push({
            name: field.name,
            value: field.value
          });
        }
      });
      return arr;
    },

    loadFilters() {
      let thisForm = document.getElementById('form_filter_data');
      this.filters = this.serializeArray(thisForm);
      this.renderFilterTags();
      return this.filters;
    },

    eventsCertificateClick() {
      document.querySelectorAll('.locator #representatives_list_wrapper .representative_certificate img').forEach(item =>{
        item.addEventListener('click', () => {
          let descKey = item.getAttribute('data-description');
          document.querySelector('#light_box_show_certificate .content_holder').innerHTML = this.certificate_descript[descKey];
          item.manualpopup({
            on_click_wrapper_selector: '.maxx-container .section',
            on_click_wrapper_class: 'manual-popup-section-hide',
            width: '450',
            popup_selector: '#light_box_show_certificate'
          });
        });
      })
    },

    locationIndexer(data){
      document.querySelector("input[name='data[Form][location_name]']").addEventListener('keyup', () => {
        this.quickRepresentFilter(data);
      });
      document.querySelector('#FormIndexForm #FormLocationName').addEventListener('keydown', (loc) => {
        let inp_val = document.getElementById('FormLocationName').value;
        if (loc.keyCode === 13) {
          loc.preventDefault();
          this.getRepList({ by_name: inp_val });
        }
      });
    },

    alternateServiceFilters(){
      document.querySelectorAll('.toggle_service_filters').forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          this.checkUncheck();
          this.filterVisible = !this.filterVisible;
          this.toggleServiceFilters();
        });
      });
    },

    toggleMoreOptions(){
      if(document.querySelector('#toggle_more_options') !== null){
        document.querySelector('#toggle_more_options').addEventListener('click', () => {
          document.querySelector('#toggle_more_options').classList.toggle('active');
          if(document.querySelector('#toggle_more_options').classList.contains('active')){
            document.querySelector('#more_options_wrapper').style.display = 'block';
          }else{
            document.querySelector('#more_options_wrapper').style.display = 'none';
          }
        })
      }
    },

    toggleCheckbox(){
      document.querySelectorAll('#form_filter_data input.input_checkbox').forEach(element => {
        element.addEventListener('click', () => {
          if (element.id === 'WorkWeekend') {
            this.sliderButton(element);
          }
          this.loadFilters();
          this.getRepList(this.filters);
        })
      });
    },

    removeFilter(){
      let filterRemoval = document.querySelectorAll('#wrapper_selected_filters a .glyphicon-remove');

      filterRemoval.forEach(filter => {
        filter.addEventListener('click', () => {
          let el = filter.closest('a');
          let input_el = document.querySelector(
              '.locator #form_filter_data input.input_filter_checkbox[name="' +
              el.getAttribute('data-selector') +
              '"]'
          );
          this.helperUncheckElement(input_el);
          el.parentNode.removeChild(el);
          this.loadFilters();
          this.getRepList(this.filters);
          this.resizeFilterList(true);
          return false;
        })
      });
    },

    certWrapper(){
      if(document.querySelector('.cert_wrapper') !== null){
        document.querySelector('.cert_wrapper').addEventListener('click', (cert) => {
          let _el = cert.querySelector('input.certificate_input');
          this.helperToggleCheckElement(_el);
          this.loadFilters();
          this.getRepList(this.filters);
          return false;
        });
      }
    },

    cancelFilter(){
      document.querySelector('#filter_cancel').addEventListener('click', (e) => {
        e.preventDefault();
        this.filterVisible = false;
        this.toggleServiceFilters();

        document.querySelectorAll('#form_filter_data input.input_checkbox').forEach(item => {
          this.helperUncheckElement(item);
        });
        this.loadFilters();
        this.getRepList(this.filters);
        this.resizeFilterList(true);
      });
    },

    warrantyIcon(){
      if(document.querySelector('.warranty_icon') !== null) {
        document.querySelector('.warranty_icon').addEventListener('click', (icon) => {
          icon.closest('#warranties').querySelector('.warranty_description').classList.toggle('active');
          if(icon.closest('#warranties').querySelector('.warranty_description').classList.contains('active')){
            icon.closest('#warranties').querySelector('.warranty_description').style.display = 'block';
          }
        });
      }
    },


    eventsFilters(data) {
      this.locationIndexer(data);
      this.alternateServiceFilters();
      this.toggleMoreOptions();
      this.toggleCheckbox();
      this.removeFilter();
      this.cancelFilter();
      this.certWrapper();
      this.warrantyIcon();
    },

    eventToggleItem() {
      this.toggleItems = document.querySelectorAll('.item_toggle_btn');
      this.toggleItems.forEach(item => {
        item.addEventListener('click', () => {
          item.closest('.item').querySelector('.representative_arrow').classList.toggle('flipped');
            item.closest('.item').querySelector('.item_toggle_wrapper').classList.toggle('active');
        });
      });
    },

    filtersSelectAuto(filters) {
      if (typeof filters == 'undefined') return true;
      let el = null;
      let pars = filters.split('_');

      let dataCertificate = document.querySelector('#form_filter_data #warranties .cert_wrapper input.certificate_input[name="data[Certificate][' +
          pars[1] +
          ']"]');

      switch (pars[0]) {
        case 'cert':
          el = dataCertificate;
          break;
      }

      if (el == null) return true;

      this.helperToggleCheckElement(el);
      this.loadFilters();
      this.getRepList(this.filters);
    },

    popupCertData(data) {
      let desc_el = document.querySelector(data.click_el).closest('.wrapper_cert_descr').querySelector('.warranty_description');

      document.querySelector('#certificate_dialog .title').innerHTML = desc_el.getAttribute('data-title');
      document.querySelector('#certificate_dialog .cert_descr').innerHTML = desc_el.innerHTML;
    },

    event_infoWindow_coupon(repres_id) {
      this.getCupons({ representative_id: repres_id });
      return false;
    },

    eventsOnItem() {

      document.querySelectorAll('.item_map_link').forEach(item => {
        item.addEventListener('click', () => {

          document.body.classList.add('service_network_show_map');
          this.helperScrollTop();

          let _opt = {
            lat: item.getAttribute('data-gmaps_lat'),
            lng: item.getAttribute('data-gmaps_lng'),
            zoom: 14,
            element: [item.closest('.item')],
            mapOptions: { draggable: true, disableDefaultUI: false },
            autoZoom: 0
          };

          if (this.isMobile) {
            _opt.infoBox = {
              main_holder_el: 'mobile_map_info_window',
              custom_infoBox_selector: '#google_marker_holder_wrapper'
            };
            _opt.mapOptions = { draggable: true, disableDefaultUI: true };
          }

          this.mapLocation(_opt);

        })
      })

    },

    eventsOnMainButtons() {
      if(document.querySelector('#locator_mobile_menu .locator_show_map') !== null){
        document.querySelector('#locator_mobile_menu .locator_show_map').addEventListener(
            'click',
            () => {
              this.viewToogle('map');

              this.helperScrollTop();
              this.mapLocation({
                mapOptions: { draggable: true, disableDefaultUI: false },
                infoBox: {
                  main_holder_el: 'mobile_map_info_window',
                  custom_infoBox_selector: '#google_marker_holder_wrapper'
                }
              });
              return false;
            }
        );
      }
      if(document.querySelector('#locator_mobile_menu .locator_show_menu') !== null){
        document.querySelector('#locator_mobile_menu .locator_show_menu').addEventListener(
            'click',
            () => {
              this.viewToogle('list');
              this.helperScrollTop();
              return false;
            }
        );
      }
      if(document.querySelector('#searchNearestRep') !== null){
        document.querySelector('#searchNearestRep').addEventListener('click', () => {
          this.getRepListByLocation();
          document.querySelector("#form_location_name input[name='data[Form][location_name]'] ").value = '';
          return false;
        });
      }
      if(document.querySelector('#searchByInputLocation') !== null){
        document.querySelector('#searchByInputLocation').addEventListener(
            'click',
            () => {
              let inp_val = document.getElementById('FormLocationName').value;
              this.getRepListByLocation({ city: inp_val });
              document.querySelector("#form_location_name input[name='data[Form][location_name]'] ").value = '';
              return false;
            }
        );
      }
      if(document.querySelector('#search_my_current_location') !== null){
        document.querySelector('#search_my_current_location').addEventListener('click',  () => {
          return false;
        });
      }
      if(document.querySelector('.location_form_button') !== null){
        document.querySelector('.location_form_button').addEventListener('click',  () => {
          return false;
        });
      }
    },

    viewToogle(view_name) {
      if (view_name === 'map') {
        document.body.addClass('service_network_show_map');
      } else if (view_name === 'list') {
        document.body.removeClass('service_network_show_map');
      }
    },

    getNumber(number){
      let thisIsNumber = number.replace(/[^0-9]/g, "");
      if(thisIsNumber !== null){
        return thisIsNumber;
      }else{
        return false;
      }
    },

    getTypeFromBrackets(text){
      let splitText = text.split('[');
      let re = /(\w+)\]/;
      if(/^[a-z]+$/i.test(splitText[2].match(re)[1])){
        return splitText[2].match(re)[1];
      }else{
        return false;
      }
    },

    searchForValue(nameKey, myArray){
      for (let i=0; i < myArray.length; i++) {
        if (myArray[i].name === nameKey) {
          return myArray[i];
        }
      }
    },

    filteringReps(){
      if(this.filters.length ){

        this.emptyRep = [];

        /*Selecting regions only*/
        this.presentRepList.forEach(rep => {
          const foundRegion = this.filters.some(filter => {
            if(this.getNumber(filter.name)) {
              this.onlyRegions = true;
              return this.getNumber(filter.name) === rep.regions.region_id;
            }
          });
          if(foundRegion){
            this.emptyRep.push(rep)
          }
        });

        /*Selecting single filters*/
        if(!this.onlyRegions){
          this.singleFilters();
        }

        /*Selecting multiple filters*/
        if(this.emptyRep.length){
          this.multipleFilters();
        }
      }
    },

    singleFilters(){
      let emptyWords = [];
      this.presentRepList.forEach(rep => {
        const foundWord = this.filters.some(filter => {
          if(this.getTypeFromBrackets(filter.name)){
            this.onlyRegions = false;
          }
          if(!this.searchForValue('data[Work][weekend]', this.filters) && this.searchForValue('data[Service][service]', this.filters) && this.searchForValue('data[Service][sale]', this.filters)){
            if(rep.representatives.sale === '1' && rep.representatives.service === '1'){
              this.onlyRegions = false;
              return this.getTypeFromBrackets(filter.name) === 'sale';
            }
          }else if(!this.searchForValue('data[Work][weekend]', this.filters) && !this.searchForValue('data[Service][service]', this.filters) && this.searchForValue('data[Service][sale]', this.filters)){
            if(rep.representatives.sale === '1'){
              this.onlyRegions = false;
              return this.getTypeFromBrackets(filter.name) === 'sale';
            }
          }else if(!this.searchForValue('data[Work][weekend]', this.filters) && this.searchForValue('data[Service][service]', this.filters) && !this.searchForValue('data[Service][sale]', this.filters)){
            if(rep.representatives.service === '1'){
              this.onlyRegions = false;
              return this.getTypeFromBrackets(filter.name) === 'service';
            }
          }else if(this.searchForValue('data[Work][weekend]', this.filters) && !this.searchForValue('data[Service][service]', this.filters) && !this.searchForValue('data[Service][sale]', this.filters)){
            if(rep.representatives.sale === '1' || rep.representatives.service === '1'){
              if(typeof rep.work_hours.sale != 'undefined' && (rep.work_hours.sale.work_day.days[6] || rep.work_hours.service.work_day.days[6])){
                return this.getTypeFromBrackets(filter.name) === 'weekend';
              }
            }
          }else if(this.searchForValue('data[Work][weekend]', this.filters) && this.searchForValue('data[Service][service]', this.filters) && !this.searchForValue('data[Service][sale]', this.filters)){
            console.log('Am I in here?')
            if(rep.representatives.service === '1'){
              if(rep.work_hours.service.work_day.days[6]){
                return this.getTypeFromBrackets(filter.name) === 'weekend';
              }
            }
          }else if(this.searchForValue('data[Work][weekend]', this.filters) && !this.searchForValue('data[Service][service]', this.filters) && this.searchForValue('data[Service][sale]', this.filters)){
            if(rep.representatives.sale === '1'){
              if(rep.work_hours.sale.work_day.days[6]){
                return this.getTypeFromBrackets(filter.name) === 'weekend';
              }
            }
          }else if(this.searchForValue('data[Work][weekend]', this.filters) && this.searchForValue('data[Service][service]', this.filters) && this.searchForValue('data[Service][sale]', this.filters)){
            if(rep.representatives.sale === '1' && rep.representatives.service === '1'){
              if((rep.representatives.sale === '1' && rep.work_hours.sale.work_day.days[6]) && (rep.representatives.service === '1' && rep.work_hours.service.work_day.days[6])){
                return this.getTypeFromBrackets(filter.name) === 'weekend';
              }
            }
          }
        });
        if(foundWord){
          emptyWords.push(rep)
        }
      });

      this.presentRepList = emptyWords;
      if(emptyWords.length){
        let emptyWordsWithWeekend = [];
        emptyWords.forEach(rep => {
          if(this.searchForValue('data[Work][weekend]', this.filters) && this.searchForValue('data[Service][service]', this.filters) && !this.searchForValue('data[Service][sale]', this.filters)){
            this.foundWordsWithWeekend = this.filters.some(filter => {
              if(rep.representatives.service === '1'){
                if(rep.work_hours.service.work_day.days[6]){
                  return this.getTypeFromBrackets(filter.name) === 'weekend';
                }
              }
            });
          }else if(this.searchForValue('data[Work][weekend]', this.filters) && this.searchForValue('data[Service][sale]', this.filters) && !this.searchForValue('data[Service][service]', this.filters)){
            this.foundWordsWithWeekend = this.filters.some(filter => {
              if(rep.representatives.sale === '1'){
                if(rep.work_hours.sale.work_day.days[6]){
                  return this.getTypeFromBrackets(filter.name) === 'weekend';
                }
              }
            });
          }else if(this.searchForValue('data[Work][weekend]', this.filters) && this.searchForValue('data[Service][sale]', this.filters) && this.searchForValue('data[Service][service]', this.filters)){
            this.foundWordsWithWeekend = this.filters.some(filter => {
              if(rep.representatives.sale === '1' && rep.representatives.service === '1'){
                if((rep.representatives.sale === '1' && rep.work_hours.sale.work_day.days[6]) && (rep.representatives.service === '1' && rep.work_hours.service.work_day.days[6])){
                  return this.getTypeFromBrackets(filter.name) === 'weekend';
                }
              }
            });
          }
          if(this.foundWordsWithWeekend){
            emptyWordsWithWeekend.push(rep)
          }
        });
        if(emptyWordsWithWeekend.length){
          this.presentRepList = emptyWordsWithWeekend;
        }
      }
    },

    multipleFilters(){
      this.presentRepList = this.emptyRep;
      let emptyRest = [];
      this.emptyRep.forEach(rep => {
        const foundRest = this.filters.some(filter => {
          if(this.getTypeFromBrackets(filter.name)){
            this.onlyRegions = false;
          }
          if(!this.searchForValue('data[Work][weekend]', this.filters) && !this.searchForValue('data[Service][service]', this.filters) && this.searchForValue('data[Service][sale]', this.filters)){
            if(rep.representatives.sale === '1'){
              return this.getTypeFromBrackets(filter.name) === 'sale';
            }
          }else if(!this.searchForValue('data[Work][weekend]', this.filters) && this.searchForValue('data[Service][service]', this.filters) && !this.searchForValue('data[Service][sale]', this.filters)){
            if(rep.representatives.service === '1'){
              return this.getTypeFromBrackets(filter.name) === 'service';
            }
          }else if(this.searchForValue('data[Work][weekend]', this.filters) && !this.searchForValue('data[Service][service]', this.filters) && !this.searchForValue('data[Service][sale]', this.filters)){
            if((rep.representatives.sale === '1' && rep.work_hours.sale.work_day.days[6]) || (rep.representatives.service === '1' && rep.work_hours.service.work_day.days[6])){
              return this.getTypeFromBrackets(filter.name) === 'weekend';
            }
          }else if(this.searchForValue('data[Work][weekend]', this.filters) && this.searchForValue('data[Service][service]', this.filters) && !this.searchForValue('data[Service][sale]', this.filters)){
            if(rep.representatives.service === '1' && rep.work_hours.service.work_day.days[6]){
              return this.getTypeFromBrackets(filter.name) === 'weekend';
            }
          }else if(this.searchForValue('data[Work][weekend]', this.filters) && !this.searchForValue('data[Service][service]', this.filters) && this.searchForValue('data[Service][sale]', this.filters)){
            if(rep.representatives.sale === '1' && rep.work_hours.sale.work_day.days[6]){
              return this.getTypeFromBrackets(filter.name) === 'weekend';
            }
          }else if(this.searchForValue('data[Work][weekend]', this.filters) && this.searchForValue('data[Service][service]', this.filters) && this.searchForValue('data[Service][sale]', this.filters)){
            if((rep.representatives.sale === '1' && rep.work_hours.sale.work_day.days[6]) && (rep.representatives.service === '1' && rep.work_hours.service.work_day.days[6])){
              return this.getTypeFromBrackets(filter.name) === 'weekend';
            }
          }else if(!this.searchForValue('data[Work][weekend]', this.filters) && this.searchForValue('data[Service][service]', this.filters) && this.searchForValue('data[Service][sale]', this.filters)){
            if(rep.representatives.sale === '1' && rep.representatives.service === '1'){
              return this.getTypeFromBrackets(filter.name) === 'sale';
            }
          }
        });
        if(foundRest){
          emptyRest.push(rep)
        }
      });
      if(!this.onlyRegions){
        this.presentRepList = emptyRest;
      }
    },

    getRepList(opt_data, cb_funct) {
      opt_data = opt_data || { init: true };
      let repUrl = this.config.ajax_rep_list;
      this.loading = true;

      this.axios.get(repUrl)
        .then(response => {
        this.loading = false;
        this.presentRepList = response.data;

        if(opt_data.by_name && opt_data.by_name.length){
        let lowQ = opt_data.by_name.toLowerCase();
        this.presentRepList = this.presentRepList.filter(item => item.citys.name.toLowerCase().includes(lowQ))
        }

        this.filteringReps();

        if (opt_data.only_call_cb_fun === true) {
          if (typeof cb_funct != 'undefined') {
            cb_funct();
          }
        } else {
          this.renderItems();
          if (opt_data.init) {
            this.afterRenderItems(opt_data.init);
          } else {
            this.afterRenderItems(false);
          }
        }
      }).catch(error => {
        console.log(`Error is: `, error)
      });
    },

    getCupons(opt_data) {
      opt_data = opt_data || {};
      let couponsUrl = this.config.ajax_coupons;

      this.axios.get(couponsUrl, {
        data: opt_data
      }).then(response => {
        this.testCouponList = response.data;
        this.render_coupons();
      }).catch(err => {
        console.log(err)
      })
    },

    getRepListByLocation(location_obj, alt_long_data) {
      alt_long_data = alt_long_data || false;

      if (typeof location_obj == 'undefined') {
        let success_fn = function(position) {
          this.getRepListByLocation(position, true);
        };
        navigator.geolocation.getCurrentPosition(success_fn);
        return true;
      }

      if (location_obj.country == null)
        location_obj.country =
            this.config.translations.location_country_en;

      if (alt_long_data) {
        let repUrl = this.config.ajax_rep_list_by_location;
        this.axios.get(repUrl, {
          data: {
            location: '',
            lat: location_obj.coords.latitude,
            lng: location_obj.coords.longitude
          }
        }).then(response => {
            this.presentRepList = response.data;
          this.renderItems();
          this.afterRenderItems(false);
        }).catch(err => {
          console.log(err);
        })
      } else {
        let googleUrl = `https://maps.google.com/maps/api/geocode/json?sensor=false&address=${location_obj.country}+${location_obj.city}`;
        let locUrl = this.config.ajax_rep_list_by_location;
        this.axios.get(googleUrl).then(response => {
          return this.axios.get(locUrl, {
            data: {
              location: location_obj.city,
              lat: res.results[0].geometry.location.lat,
              lng: res.results[0].geometry.location.lng
            }
          }).then(res => {
            this.presentRepList = res.data;
            this.renderItems();
            this.afterRenderItems(false);
          }).catch(error => {
            console.log(error);
          })
        }).catch(err => {
          console.log(err)
        });
      }
    },

    /*getCurrentLocation(cb_success) {
      // Get Your current location
      let ipUrl = 'https://ip-api.com/json';
      this.axios.get(ipUrl).then(response => {
        cb_success(response.data)
      }).catch(err => {
        console.log(err)
      });
    },*/

    findRepByID(id) {
      let ret = null;
      this.presentRepList.forEach(item => {
        if (item.representatives.representative_id === id) {
          ret = this;
          return false;
        }
      });
      return ret;
    },

    isMobile() {
      return !!(document.body.classList.contains('xs-view') || document.body.classList.contains('sm-view'));
    },

    helperUncheckElement(el) {
      el.checked = false;
      el.classList.remove('checked');
      el.closest('.input_check').classList.remove('checked');
    },

    helperToggleCheckElement(el) {
      if (el.closest('.input_check').classList.contains('checked')) {
        el.checked = false;
        el.classList.remove('checked');
        el.closest('.input_check').classList.remove('checked');
      } else {
        el.checked = false;
        el.classList.remove('checked');
        el.closest('.input_check').classList.remove('checked');
      }
    },

    helperScrollTop(data) {
      data = data || { speed: 200 };
      let bodyRect = document.body.getBoundingClientRect();
      let offsetBody = {
        top: bodyRect.top + window.scrollY,
        left: bodyRect.left + window.scrollX
      }
      this.scrollIt(offsetBody.top, data.speed, 'easeOutQuad');
    },

    scrollIt(destination, duration = 200, easing = 'linear', callback) {
      const easings = {
        linear(t) {
          return t;
        },
        easeInQuad(t) {
          return t * t;
        },
        easeOutQuad(t) {
          return t * (2 - t);
        },
        easeInOutQuad(t) {
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        },
        easeInCubic(t) {
          return t * t * t;
        },
        easeOutCubic(t) {
          return --t * t * t + 1;
        },
        easeInOutCubic(t) {
          return t < 0.5
              ? 4 * t * t * t
              : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        },
        easeInQuart(t) {
          return t * t * t * t;
        },
        easeOutQuart(t) {
          return 1 - --t * t * t * t;
        },
        easeInOutQuart(t) {
          return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
        },
        easeInQuint(t) {
          return t * t * t * t * t;
        },
        easeOutQuint(t) {
          return 1 + --t * t * t * t * t;
        },
        easeInOutQuint(t) {
          return t < 0.5
              ? 16 * t * t * t * t * t
              : 1 + 16 * --t * t * t * t * t;
        }
      };

      const start = window.pageYOffset;
      const startTime =
          'now' in window.performance ? performance.now() : new Date().getTime();

      const documentHeight = Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.clientHeight,
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight
      );
      const windowHeight =
          window.innerHeight ||
          document.documentElement.clientHeight ||
          document.body.clientHeight;
      const destinationOffset =
          typeof destination === 'number' ? destination : destination.offsetTop;
      const destinationOffsetToScroll = Math.round(
          documentHeight - destinationOffset < windowHeight
              ? documentHeight - windowHeight
              : destinationOffset
      );

      if (!('requestAnimationFrame' in window)) {
        window.scroll(0, destinationOffsetToScroll);
        if (callback) {
          callback();
        }
        return;
      }

      const scroll = () => {
        const now =
            'now' in window.performance
                ? performance.now()
                : new Date().getTime();
        const time = Math.min(1, (now - startTime) / duration);
        const timeFunction = easings[easing](time);
        window.scroll(
            0,
            Math.ceil(timeFunction * (destinationOffsetToScroll - start) + start)
        );

        if (window.pageYOffset === destinationOffsetToScroll) {
          if (callback) {
            callback();
          }
          return;
        }

        requestAnimationFrame(scroll);
      }

      scroll();
    },
  },
  created() {
    this.init(
        {
          ajax_rep_list_by_location:`./${this.paramData}/getRepresentativeListByLocation`,
          ajax_rep_list:`./${this.paramData}/getRepresentativeList`,
          service_url:this.serviceUrl,
          init_data:null
        },
        {
          translations: this.translationData
        }
    );
    this.checkUncheck();
  },
  mounted() {

  }
};
</script>

<style scoped></style>




