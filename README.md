# REALL

Запуск:

```bash
npm install
npm run dev
```

## Архитектура

`src/pages/index.astro` — только оболочка страницы.

`src/components/ReallExperience.astro` — разметка сцены REALL.

`src/data/projects.json` — проекты, кадры, тексты, объект кадра и медиа.

`public/app.js` — смена проектов/кадров, загрузка медиа конкретного кадра, модалки, нейросеть.

`src/styles/global.css` — единая система слоёв и визуальный стиль.

## Слои снизу вверх

1. `.experience` — базовая подложка сайта.
2. `.frame-bg` — абстрактный фон конкретного кадра.
3. `.frame-media` — фото/видео конкретного кадра.
4. `.neural-field` — живая нейросеть.
5. `.light-vignette` — виньетка/свет.
6. `.film-stage` — объект кадра.
7. UI: меню, тексты, вкладки, логотип, CTA.
8. `.modal` — всплывающие окна.

## Медиа

Медиа лежат по структуре:

```text
public/projects/<project-id>/frames/<frame-id>/<file>.webp
```

Пример:

```text
public/projects/livetile/frames/question/office.webp
```

В `projects.json` путь указывается от корня сайта:

```json
"media": ["/projects/livetile/frames/question/office.webp"]
```
