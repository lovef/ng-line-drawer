import { TestBed, async, ComponentFixture } from '@angular/core/testing'
import { AppComponent } from './app.component'

describe('AppComponent', () => {

  let fixture: ComponentFixture<AppComponent>
  let app: AppComponent


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
    }).compileComponents()
    fixture = TestBed.createComponent(AppComponent)
    app = fixture.debugElement.componentInstance
  }))

  it('should create the app', async(() => {
    expect(app).toBeTruthy()
  }))

  it(`should have correct title`, async(() => {
    expect(app.title).toEqual('line-drawer')
  }))

  it(`canvas should fill the screen`, async(() => {
    app.ngOnInit()

    expect(app.canvas).toBeDefined()
    expect(app.canvas.nativeElement.width).toEqual(window.innerWidth)
    expect(app.canvas.nativeElement.height).toEqual(window.innerHeight)
  }))
})
