import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { AiService } from '../src/ai/ai.service';

const MOCK_CODE = `export default function GeneratedApp() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-bold">Mock Landing</h1>
      <p className="text-slate-400 mt-2">E2E test page</p>
    </div>
  );
}`;

describe('Generate UI (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AiService)
      .useValue({
        generateUiCode: jest.fn().mockResolvedValue(MOCK_CODE),
        modifyUiCode: jest.fn().mockResolvedValue(MOCK_CODE),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /generate-ui returns GeneratedUi', () => {
    return request(app.getHttpServer())
      .post('/generate-ui')
      .send({ prompt: 'Create a simple landing page' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({
          prompt: 'Create a simple landing page',
          code: expect.stringContaining('GeneratedApp'),
        });
        expect(res.body.id).toBeDefined();
        expect(res.body.createdAt).toBeDefined();
      });
  });

  it('POST /generate-ui rejects empty prompt', () => {
    return request(app.getHttpServer())
      .post('/generate-ui')
      .send({ prompt: '' })
      .expect(400);
  });

  it('POST /modify-ui returns GeneratedUi', () => {
    return request(app.getHttpServer())
      .post('/modify-ui')
      .send({
        instruction: 'Make the headline larger',
        currentCode: MOCK_CODE,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.code).toContain('GeneratedApp');
      });
  });
});
