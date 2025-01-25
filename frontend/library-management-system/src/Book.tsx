import { Fragment, useEffect, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  Container,
  Divider,
  Chip,
  Table,
  TableContainer,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import transition from "./utils/transition";

interface Author {
  id: number;
  name: string;
  bio: string;
}

interface Book {
  bookID: number;
  authors: Array<Author>;
  genre_name: string;
  language_name: string;
  language_shortcut: string;
  title: string;
  description: string;
  isbn: string;
  published_date: string;
  page_count: number;
  created_at: string;
  updated_at: string;
  genre: number;
  language: number;
}

interface BookQueue {
  book_queue_id: number;
  user_id: number;
  book_id: number;
  queue_date: string;
  turn: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

type BookProps = {
  book: Book;
  isAdmin: boolean;
};


function getCookie(name: string) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}


const Book: React.FC<BookProps> = ({ book, isAdmin }) => {

  const [selected, setSelected] = useState<number | null>(null);
  const [bookQueue, setBookQueue] = useState<Array<BookQueue>>([]);
  const [loading, setLoading] = useState(false);
  const [reservationStatus, setReservationStatus] = useState<string | null>(null);
  const [reservationDate, setReservationDate] = useState<string | null>(null);

  useEffect(() => {
    const csrftoken = getCookie('csrftoken');
    const fetchBookQueue = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/book_queue/${book.bookID}/`);
        setLoading(false);

        if (!response.ok) {
          throw Error(`Error ${response.status}`);
        }
        const data = await response.json();
        setBookQueue(data);
      }
      catch (error) {

      }
    }
    const fetchReservationStatus = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/reserve-book/${book.bookID}/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              'X-CSRFToken': csrftoken,
            },
            credentials: "include",

          });


        if (!response.ok) {
          throw Error(`Error ${response.status}`);
        }
        else {
          const result = await response.json();
          console.log(result);
          setReservationStatus(result.status);
          if (result.status === "Ready" || result.status === "Waiting") {
            setReservationDate(result.available_date);
          }
        }
      }
      catch (error) {

      }
    }


    setSelected(null);
    setLoading(true);
    setBookQueue([]);
    fetchBookQueue();
    fetchReservationStatus();
  }, [book.bookID]);

  const handleReserveBook = async () => {
    try {
      const csrftoken = getCookie('csrftoken');
      if (!csrftoken) throw Error(`Error`);

      const response = await fetch(`http://localhost:8000/api/reserve-book/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'X-CSRFToken': csrftoken,
        },
        credentials: "include",
        body: JSON.stringify({ book_id: book.bookID }),
      });

      if (!response.ok) {
        throw Error(`Error ${response.status}`);
      } else {
        const result = await response.json();
        console.log(result);
        if (result.status === "Ready" || result.status === "Waiting") {
          setReservationStatus(result.status);
          setReservationDate(result.available_date);
          alert(
            `Book reserved successfully. Available date: ${result.available_date}`
          );
        } else {
          alert(`Book reservation failed: ${result.message}`);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        alert("Failed to reserve book: " + error.message);
      } else {
        alert("Failed to reserve book: An unknown error occurred.");
      }
    }
  };


  if (book == null) return <>Loading...</>;

  return (
    <Container maxWidth="md" sx={{ paddingY: 5 }}>
      <Box
        position="relative"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={2}
      >
        <Typography variant="h2" sx={{ mb: "15px" }}>
          {book.title}
        </Typography>

        <Typography sx={{ mb: "15px" }}>{book.description}</Typography>

        <Divider textAlign="left" style={{ width: "100%" }}>
          Authors
        </Divider>

        <Paper
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            flexWrap: "wrap",
            gap: 1,
            p: 0.5,
            m: 0,
            width: "100%",
          }}
          component="ul"
        >
          {book.authors.map((author, index) => {
            return (
              <li key={index} style={{ listStyleType: "none" }}>
                <Chip
                  sx={{ margin: 0.5 }}
                  label={author.name}
                  onClick={() => console.log("a")}
                />
              </li>
            );
          })}
        </Paper>

        <Divider sx={{ mt: "15px", width: "100%" }} />

        <Box display="flex" justifyContent="space-between" width="100%" gap={2}>
          <Box flex={1} textAlign="left">
            <Typography>
              <b>Published: </b> {book.published_date}
            </Typography>
            <Typography>
              <b>ISBN: </b> {book.isbn}
            </Typography>
            <Typography>
              <b>Language: </b>{" "}
              {book.language_name
                ? book.language_name + " (" + book.language_shortcut + ")"
                : ""}
            </Typography>
          </Box>
          <Box flex={1} textAlign="left">
            <Typography sx={{ textTransform: "capitalize" }}>
              <b>Genre: </b> {book.genre_name}
            </Typography>
            <Typography>
              <b>Pages: </b> {book.page_count}
            </Typography>
          </Box>
        </Box>

        {!isAdmin ? (
          <>
            {reservationStatus === "not_reserved" && (
              <Button
                sx={{ mt: "100px" }}
                variant="contained"
                onClick={handleReserveBook}
              >
                Reserve
              </Button>
            )}
            {(reservationStatus === "Waiting" || reservationStatus === "Ready") &&
              reservationDate && (
                <Box mt={2}>
                  <Typography
                    sx={{
                      color: reservationStatus === "Ready" ? "green" : "orange",
                    }}
                  >
                    <b>
                      {reservationStatus === "Ready" ? "Pickup date:" : "Estimated pickup date:"}
                    </b>{" "}
                    {reservationDate}
                  </Typography>
                  {reservationStatus === "Ready" && (
                    <Typography sx={{ color: "green" }}>Ready for pickup!</Typography>
                  )}
                </Box>
              )}
          </>
        ) : (
          <Fragment>

            {bookQueue.length > 0 ? (
              <Fragment>
                <TableContainer sx={{ mt: "50px" }} component={Paper}>
                  <Table sx={{ minWidth: 650 }} size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell></TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell align="right">E-Mail</TableCell>
                        <TableCell align="right">Phone number</TableCell>
                        <TableCell align="right">Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bookQueue.map((row, index) => (
                        <TableRow
                          key={row.book_queue_id}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selected === index}
                              onChange={(e) => {
                                setSelected((e.target.checked) ? index : null);
                              }}
                            />
                          </TableCell>
                          <TableCell component="th" scope="row">
                            {row.first_name + " " + row.last_name}
                          </TableCell>
                          <TableCell align="right">{row.email}</TableCell>
                          <TableCell align="right">{row.phone_number}</TableCell>
                          <TableCell align="right">{row.queue_date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Button
                  sx={{ mt: "25px" }}
                  variant="contained"
                  disabled={selected === null}
                >
                  Borrow
                </Button>
              </Fragment>
            ) : (
              loading ? (
                <CircularProgress />
              ) : (
                <Typography sx={{ mt: "50px" }}>No reservations</Typography>
              )
            )}



            <Button
              sx={{ mt: "20px" }}
              onClick={() => window.open(`${window.location.origin}/librarian/book?book_id=${book.bookID}`)}
            >
              Edit
            </Button>
          </Fragment>
        )}

      </Box>
    </Container >
  );
};

export default transition(Book);
