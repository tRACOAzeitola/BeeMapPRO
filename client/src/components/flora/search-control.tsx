import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-control-geocoder';

// Define custom types for the Leaflet extensions
declare module 'leaflet' {
  namespace Control {
    namespace Geocoder {
      function nominatim(options?: any): any;
    }
    function geocoder(options?: any): any;
  }
}

const SearchControl = () => {
  const map = useMap();
  const searchControlRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    // Criar controle de geocodificação
    const geocoder = (L.Control.Geocoder as any).nominatim({
      geocodingQueryParams: {
        countrycodes: 'pt,es', // Portugal e Espanha como foco principal
        viewbox: '-9.5,42,-6,36.5', // Bounding box aproximada para Portugal
        bounded: 0 // Não restringir estritamente à viewbox
      }
    });

    // Criar um controle personalizado apenas com ícone de lupa
    const searchButton = L.Control.extend({
      options: {
        position: 'topleft'
      },
      
      onAdd: function() {
        // Criar container
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-search-button');
        
        // Criar botão de lupa
        const button = L.DomUtil.create('a', 'leaflet-control-search-icon', container);
        button.href = '#';
        button.title = 'Pesquisar localização';
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>';
        
        // Armazenar o controle de geocoder para ser usado depois
        const searchControl = (L.Control as any).geocoder({
          defaultMarkGeocode: false,
          position: 'topleft',
          placeholder: 'Pesquisar localização...',
          errorMessage: 'Nenhum resultado encontrado.',
          suggestMinLength: 3,
          suggestTimeout: 250,
          queryMinLength: 1,
          geocoder: geocoder,
          collapsed: false, // Definir como sempre visível quando adicionado
          expand: 'click'
        });
        
        searchControlRef.current = searchControl;
        
        // Manipular o clique no botão de lupa
        L.DomEvent.on(button, 'click', function(e) {
          L.DomEvent.stop(e);
          
          // Verificar se o controle já foi adicionado ao mapa verificando o DOM
          const geocoderEl = document.querySelector('.leaflet-control-geocoder') as HTMLElement;
          
          if (!geocoderEl) {
            // Se não existir no DOM, adicionar ao mapa
            searchControl.addTo(map);
            
            // Adicionar classe CSS para controlar a visibilidade do controle
            const geocoderElement = document.querySelector('.leaflet-control-geocoder') as HTMLElement;
            if (geocoderElement) {
              L.DomUtil.addClass(geocoderElement, 'geocoder-visible');
            }
            
            // Focar no input após adicionar o controle
            setTimeout(() => {
              const input = document.querySelector('.leaflet-control-geocoder-form input') as HTMLInputElement;
              if (input) {
                // Impedir que o mapa capture eventos do input
                L.DomEvent.disableClickPropagation(input);
                L.DomEvent.disableScrollPropagation(input);
                
                // Focar no input
                input.focus();
              }
            }, 100);
            
            // Adicionar classe para indicar que o botão de lupa está ativo
            L.DomUtil.addClass(container, 'active');
          } else {
            // Se o controle já existe, apenas alternar a visibilidade
            if (L.DomUtil.hasClass(geocoderEl, 'geocoder-visible')) {
              L.DomUtil.removeClass(geocoderEl, 'geocoder-visible');
              L.DomUtil.removeClass(container, 'active');
            } else {
              L.DomUtil.addClass(geocoderEl, 'geocoder-visible');
              L.DomUtil.addClass(container, 'active');
              
              const input = document.querySelector('.leaflet-control-geocoder-form input') as HTMLInputElement;
              if (input) {
                input.focus();
              }
            }
          }
        });
        
        // Manipular o evento de geocodificação
        searchControl.on('markgeocode', function(e: any) {
          const { center, name } = e.geocode;
          
          // Criar um marcador temporário no local
          const marker = L.marker(center)
            .addTo(map)
            .bindPopup(`<b>${name}</b><br>Clique para desenhar aqui`)
            .openPopup();
          
          // Ao clicar no popup, remover o marcador e centralizar o mapa
          marker.on('popupopen', () => {
            const popupContent = marker.getPopup()?.getContent();
            
            // Substituir o conteúdo do popup por um com botão
            marker.getPopup()?.setContent(`
              ${popupContent}
              <br><button id="draw-here-btn" style="margin-top: 8px; padding: 5px 10px; background-color: #1a56db; color: white; border: none; border-radius: 4px; cursor: pointer;">Desenhar Aqui</button>
            `);
            
            // Adicionar evento ao botão após o popup ser aberto
            setTimeout(() => {
              const drawBtn = document.getElementById('draw-here-btn');
              if (drawBtn) {
                drawBtn.addEventListener('click', () => {
                  // Centralizar o mapa neste ponto
                  map.setView(center, 15);
                  
                  // Remover o marcador
                  map.removeLayer(marker);
                  
                  // Ativar a ferramenta de desenho (simulando um clique no botão de polígono)
                  const drawButton = document.querySelector('.leaflet-draw-draw-polygon') as HTMLElement;
                  if (drawButton) {
                    drawButton.click();
                  }
                });
              }
            }, 100);
          });
          
          // Centralizar o mapa no resultado
          map.flyTo(center, 14);
          
          // Ocultar o controle de pesquisa após a seleção
          const geocoderEl = document.querySelector('.leaflet-control-geocoder') as HTMLElement;
          if (geocoderEl) {
            L.DomUtil.removeClass(geocoderEl, 'geocoder-visible');
            L.DomUtil.removeClass(container, 'active');
          }
        });
        
        return container;
      }
    });
    
    // Adicionar botão de lupa ao mapa
    const searchBtn = new searchButton();
    map.addControl(searchBtn);

    // Limpar ao desmontar
    return () => {
      if (searchControlRef.current && map) {
        try {
          const geocoderEl = document.querySelector('.leaflet-control-geocoder');
          if (geocoderEl && geocoderEl.parentNode) {
            geocoderEl.parentNode.removeChild(geocoderEl);
          }
        } catch (e) {
          console.log('Erro ao remover controle de pesquisa', e);
        }
      }
    };
  }, [map]);

  return null; // Este componente não renderiza nada no DOM diretamente
};

export default SearchControl; 