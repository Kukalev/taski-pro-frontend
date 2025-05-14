<img alt="logo.png" height="200" src="docs/pics%2Flogo 1.png" width="200" float="middle"/>

🚀**От беклога - до прода**🚀

# Навигация

[1. О проекте](#description)

[2. Стек технологий](#stack)

[3. Документация](#docs)

[4. Развертывание](#deploy)

[5. Команда](#team)

<a name="description"/>

# О проекте

Taski.pro - сервис для управления командными проектами на основе канбан-досок с задачами\
Мы - новый аналог Jira, подходим не только айтишникам, но и любым специалистам, привыкшим работать четко, прозрачно и в срок

Не понимаете, как приступить к сложной задаче и организовать сотрудников?\
Создавайте доску проекта, утверждайте задачи и назначайте на них исполнителей!\
Мы покажем вам, как работаете вы и ваша команда, а остальное возьмем на себя

**У нас есть:**\
✔️  ИИ-помощник для оценки сложности задачи и выбора подходящего исполнителя

✔️  Ссылка на репозиторий проекта на GitHub - удобно для разработчиков (да-да, со всеми коммитами)

✔️  Файлы, которые можно прикрепить к доске или задаче - чтобы все рабочие документы были под рукой

✔️  Кастомные пользовательские темы - никакой белый фон не помешает вам спокойно кодить

✔️  Подписки - расширенное количество участников для менеджеров больших проектов

<a name="stack"/>

# Стек технологий

<img alt="java.jpg" height="80" src="https://github.com/ivakovv/Taski.pro-Back-End/blob/main/docs/pics%2Fjava.jpg" width="160"/>
<img alt="spring.jpg" height="80" src="https://github.com/ivakovv/Taski.pro-Back-End/blob/main/docs/pics%2Fspring.jpg" width="160"/>
<img alt="git.png" height="80" src="https://github.com/ivakovv/Taski.pro-Back-End/blob/main/docs/pics%2Fgit.png" width="160"/><br>
<img alt="postgresql.png" height="80" src="https://github.com/ivakovv/Taski.pro-Back-End/blob/main/docs/pics%2Fpostgresql.png" width="240"/>
<img alt="s3.png" height="80" src="https://github.com/ivakovv/Taski.pro-Back-End/blob/main/docs/pics%2Fs3.png" width="120"/>
<img alt="hibernate.jpg" height="80" src="https://github.com/ivakovv/Taski.pro-Back-End/blob/main/docs/pics%2Fhibernate.jpg" width="240"/>
<img alt="liquibase.png" height="80" src="https://github.com/ivakovv/Taski.pro-Back-End/blob/main/docs/pics%2Fliquibase.png" width="280"/><br>
<img alt="typescript.png" height="80" src="https://github.com/ivakovv/Taski.pro-Back-End/blob/main/docs/pics%2Ftypescript.png" width="240"/>
<img alt="react.png" height="80" src="https://github.com/ivakovv/Taski.pro-Back-End/blob/main/docs/pics%2Freact.png" width="160"/>
<img alt="tailwind.png" height="80" src="https://github.com/ivakovv/Taski.pro-Back-End/blob/main/docs/pics%2Ftailwind.png" width="240"/><br>
<img alt="JUnit_5.png" height="80" src="https://github.com/ivakovv/Taski.pro-Back-End/blob/main/docs/pics%2FJUnit_5.png" width="240"/>
<img alt="postman.png" height="80" src="https://github.com/ivakovv/Taski.pro-Back-End/blob/main/docs/pics%2Fpostman.png" width="240"/><br>

<a name = "docs"/>

# Документация


## Архитектура
[Архитектура системы](https://github.com/ivakovv/Taski.pro-Back-End/blob/main/docs/schemas/architecture.md) в нотации C4

## Базы данных



[ER-модель](https://github.com/ivakovv/Taski.pro-Back-End/blob/main/docs/schemas/er-db.md) базы данных PostgreSQL и S3-хранилища в нотации Мартина

<a name = "deploy"/>

# Развертывание

Данный репозиторий содержит frontend-часть приложения.\
backend хранится по [ссылке](https://github.com/ivakovv/Taski.pro-Back-End)

**Важно**\
В данном проекте мы используем платное [S3-хранилище Yandex Cloud](https://yandex.cloud/ru/docs/storage/?utm_source=yandex-s&utm_medium=cpc&utm_campaign=Search_RU_INFR_LGEN_NEW_Storage-pack_cloud|111627899&utm_content=5454570230|&utm_term=---autotargeting|16205360722&yclid=15288690489811795967) и [платное API](https://proxyapi.ru/) для запросов к ChatGPT\
Для правильной работы приложения, в проекте TaskiProBackEnd вставьте следующий код в файл application.yml
```yaml
s3:
  key_id: <ключ аккаунта Yandex>
  secret_key: <приватный ключ>
  region: ru-central1
  endpoint: https://storage.yandexcloud.net
  bucket: <имя бакета>
proxy:
  base_url: https://api.proxyapi.ru/openai/v1/chat/completions
  key: <приватный ключ ProxyApi>
```
Или укажите другую конфигурацию аналогичных сервисов, если необходимо

## Локальное развертывание
1. Скачайте репозиторий бекенда командой `git clone https://github.com/ivakovv/Taski.pro-Back-End.git`
2. Скачайте данный репозиторий командой `git clone https://github.com/Kukalev/taski-pro-frontend.git`
3. Из папки проекта TaskiProBackEnd запустите контейнеры Docker командой `docker compose up -d`
4. Запустите приложение командой `mvn spring-boot:run`
5. Из папки проекта taski-pro-frontend запустите приложение командами `npm i`, `npm run dev`

<a name = "team"/>

# Команда

[Андрей Иваков](https://github.com/ivakovv) - Backend, DevOps 

[Дима Кондратенко](https://github.com/Dmitro0) - Backend, DevOps 

[Никита Кукалёв](https://github.com/Kukalev) - Frontend, UI 

[Наташа Макушкина](https://github.com/Nathalie-mac) - SA, Backend


[Дима Сахаров](https://github.com/asushnikk) - лучший ментор

💜Проектная мастерская. Зима2025💜 

💛Т-Банк💛
